import type { Score } from './types';
import { PUZZLE_ID } from './puzzle';

export async function fetchScores(): Promise<Score[]> {
  const res = await fetch(`/api/scores?puzzle=${PUZZLE_ID}`);
  if (!res.ok) throw new Error(`GET /api/scores failed: ${res.status}`);
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
  if (!res.ok) throw new Error(`POST /api/scores failed: ${res.status}`);
  return res.json();
}
