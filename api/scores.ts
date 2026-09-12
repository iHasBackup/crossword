import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
import { PUZZLE_ID, WORDS, scoreLetters } from '../src/puzzle';
import type { Score } from '../src/types';

// Vercel's Redis (Upstash) marketplace integration injects these automatically
// when the integration is attached to the project.
const redis = Redis.fromEnv();

const TOP_N = 50;
const MIN_NAME_LEN = 2;
const MAX_NAME_LEN = 32;
const MIN_PLAUSIBLE_TIME = 20; // seconds — below this a run cannot be genuine
const MAX_PLAUSIBLE_TIME = 24 * 60 * 60; // 24h ceiling against garbage input
const RATE_LIMIT_WINDOW_S = 60;
const RATE_LIMIT_MAX = 5;

function scoresKey(puzzle: string) {
  return `scores:${puzzle}`;
}

function rateLimitKey(puzzle: string, ip: string) {
  return `ratelimit:${puzzle}:${ip}`;
}

function clientIp(req: VercelRequest): string {
  const fwd = req.headers['x-forwarded-for'];
  const first = Array.isArray(fwd) ? fwd[0] : fwd;
  return (first?.split(',')[0].trim()) || req.socket.remoteAddress || 'unknown';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const puzzle = typeof req.query.puzzle === 'string' ? req.query.puzzle : PUZZLE_ID;

  if (req.method === 'GET') {
    const raw = await redis.lrange<Score>(scoresKey(puzzle), 0, -1);
    const ranked = raw
      .slice()
      .sort((a, b) => b.words - a.words || a.time - b.time)
      .slice(0, TOP_N);
    res.status(200).json(ranked);
    return;
  }

  if (req.method === 'POST') {
    const ip = clientIp(req);
    const rlKey = rateLimitKey(puzzle, ip);
    const count = await redis.incr(rlKey);
    if (count === 1) await redis.expire(rlKey, RATE_LIMIT_WINDOW_S);
    if (count > RATE_LIMIT_MAX) {
      res.status(429).json({ error: 'Too many submissions. Try again shortly.' });
      return;
    }

    const body = req.body ?? {};
    const rawName = typeof body.name === 'string' ? body.name.trim() : '';
    const time = typeof body.time === 'number' ? Math.floor(body.time) : NaN;
    const letters = body.letters;

    if (rawName.length < MIN_NAME_LEN) {
      res.status(400).json({ error: 'Name too short.' });
      return;
    }
    const name = rawName.slice(0, MAX_NAME_LEN);

    if (!Number.isFinite(time) || time < MIN_PLAUSIBLE_TIME || time > MAX_PLAUSIBLE_TIME) {
      res.status(400).json({ error: 'Implausible time.' });
      return;
    }

    // Authoritative: score the submitted grid against the solution here.
    // The client's own word count, if any, is never trusted.
    const words = Math.min(scoreLetters(letters), WORDS.length);

    const entry: Score = { name, words, time, createdAt: new Date().toISOString() };
    await redis.rpush(scoresKey(puzzle), entry);

    res.status(200).json(entry);
    return;
  }

  res.setHeader('Allow', 'GET, POST');
  res.status(405).json({ error: 'Method not allowed' });
}
