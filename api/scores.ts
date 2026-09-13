import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
// Explicit .js extensions: package.json has "type": "module", so Vercel's
// Node runtime resolves these as native ESM at runtime, which (unlike the
// Bundler resolution used for the Vite frontend) requires a real extension.
// TypeScript resolves the .js specifier to the co-located .ts file at
// compile time; this matches the .js path the deployed function needs.
import { PUZZLE_ID, WORDS, scoreLetters } from '../src/puzzle.js';
import type { Score } from '../src/types.js';

// Vercel's Redis marketplace integration injects these under the legacy
// KV_REST_API_* names (not UPSTASH_REDIS_REST_*), so build the client explicitly.
// Built lazily inside the handler (not at module scope) so a missing/bad env
// var surfaces as a normal caught error instead of crashing the whole function
// at cold start with an opaque FUNCTION_INVOCATION_FAILED.
function getRedis(): Redis {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    throw new Error(
      'Missing KV_REST_API_URL / KV_REST_API_TOKEN — attach Redis storage to this project in the Vercel dashboard (Storage tab) and redeploy.',
    );
  }
  return new Redis({ url, token });
}

const TOP_N = 50;
const MIN_NAME_LEN = 2;
const MAX_NAME_LEN = 32;
const MIN_PLAUSIBLE_TIME = 3; // seconds — floor against literal zero-time API abuse; players who already
// know several answers (this is a campaign-lore puzzle) can genuinely finish very fast
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
  // This is a live shared leaderboard — a cached response (browser, proxy,
  // or Vercel's edge) can silently hide a just-written score after reload.
  res.setHeader('Cache-Control', 'no-store');

  try {
    const redis = getRedis();

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
  } catch (err) {
    console.error('api/scores error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
