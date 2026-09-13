import type { Score } from './types';
import { PUZZLE_ID } from './puzzle';

/** Thrown when the server actually responded with a rejection (4xx/5xx) —
 * as opposed to a network-level failure (offline, DNS, etc). Callers need
 * to tell the two apart: a rejection means the submission was NOT saved
 * and must not be shown to the player as if it succeeded. */
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function errorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json();
    if (body && typeof body.error === 'string') return body.error;
  } catch {
    /* body wasn't JSON — fall back to the generic message */
  }
  return fallback;
}

export async function fetchScores(): Promise<Score[]> {
  const res = await fetch(`/api/scores?puzzle=${PUZZLE_ID}`, { cache: 'no-store' });
  if (!res.ok) throw new ApiError(res.status, await errorMessage(res, `GET /api/scores failed: ${res.status}`));
  return res.json();
}

export async function submitScore(
  name: string,
  letters: string[],
  time: number,
): Promise<Score> {
  const res = await fetch('/api/scores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ puzzle: PUZZLE_ID, name, letters, time }),
  });
  if (!res.ok) throw new ApiError(res.status, await errorMessage(res, `POST /api/scores failed: ${res.status}`));
  return res.json();
}
