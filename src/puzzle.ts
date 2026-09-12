export const SIZE = 11;

export type Direction = 'across' | 'down';

export interface WordDef {
  num: number;
  dir: Direction;
  r: number;
  c: number;
  answer: string;
  clue: string;
}

export const PUZZLE_ID = 'crooked-moon-01';
export const PUZZLE_TITLE = 'The Crooked Moon — Puzzle No. 01';

export const WORDS: WordDef[] = [
  { num: 1, dir: 'across', r: 0, c: 0, answer: 'CROWS', clue: 'Black birds that gather where the road bends' },
  { num: 3, dir: 'across', r: 0, c: 6, answer: 'ALTAR', clue: 'Stone where the offering is left' },
  { num: 4, dir: 'across', r: 2, c: 2, answer: 'HOLLY', clue: 'Red-berried evergreen of the hedgerow' },
  { num: 5, dir: 'across', r: 4, c: 0, answer: 'EAVES', clue: 'Where the charm is nailed, above the door' },
  { num: 6, dir: 'across', r: 4, c: 6, answer: 'STAGS', clue: 'Antlered watchers of the wood' },
  { num: 8, dir: 'across', r: 6, c: 2, answer: 'NIGHT', clue: 'When the lanterns go out' },
  { num: 11, dir: 'across', r: 8, c: 0, answer: 'ELDER', clue: 'Both a village authority and a flowering tree' },
  { num: 12, dir: 'across', r: 8, c: 6, answer: 'MASKS', clue: 'Worn by the whole village on festival night' },
  { num: 13, dir: 'across', r: 10, c: 2, answer: 'OMENS', clue: 'Signs read in milk, smoke or entrails' },
  { num: 1, dir: 'down', r: 0, c: 0, answer: 'CRONE', clue: 'The old woman at the edge of the village' },
  { num: 2, dir: 'down', r: 0, c: 4, answer: 'SALTS', clue: 'Poured across a threshold to keep things out' },
  { num: 3, dir: 'down', r: 0, c: 6, answer: 'ABYSS', clue: 'What the well seems to have no bottom for' },
  { num: 4, dir: 'down', r: 2, c: 2, answer: 'HAVEN', clue: 'Sanctuary, of a sort' },
  { num: 7, dir: 'down', r: 4, c: 8, answer: 'ASHES', clue: 'All that the pyre leaves behind' },
  { num: 9, dir: 'down', r: 6, c: 4, answer: 'GORSE', clue: 'Thorny yellow-flowered scrub of the moor' },
  { num: 10, dir: 'down', r: 6, c: 6, answer: 'TOMBS', clue: 'Where the barrow-folk keep their dead' },
];

export const idx = (r: number, c: number) => r * SIZE + c;

export function cellsOf(w: WordDef): number[] {
  const out: number[] = [];
  for (let k = 0; k < w.answer.length; k++) {
    out.push(w.dir === 'across' ? idx(w.r, w.c + k) : idx(w.r + k, w.c));
  }
  return out;
}

export function buildSolution(): { sol: (string | null)[]; nums: string[] } {
  const sol: (string | null)[] = new Array(SIZE * SIZE).fill(null);
  const nums: string[] = new Array(SIZE * SIZE).fill('');
  WORDS.forEach((w) => {
    const cells = cellsOf(w);
    cells.forEach((cellIdx, k) => {
      sol[cellIdx] = w.answer[k];
    });
    if (!nums[idx(w.r, w.c)]) nums[idx(w.r, w.c)] = String(w.num);
  });
  return { sol, nums };
}

export const OPEN_CELL_COUNT = 61;

/** Server-side authoritative scoring: counts words fully matching the solution. Never trust a client-reported word count. */
export function scoreLetters(letters: unknown): number {
  if (!Array.isArray(letters) || letters.length !== SIZE * SIZE) return 0;
  return WORDS.filter((w) => cellsOf(w).every((i, k) => letters[i] === w.answer[k])).length;
}
