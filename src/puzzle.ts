export const SIZE = 16;

export type Direction = 'across' | 'down';

export interface WordDef {
  num: number;
  dir: Direction;
  r: number;
  c: number;
  answer: string;
  clue: string;
}

export const PUZZLE_ID = 'crooked-moon-02';
export const PUZZLE_NUMBER = '02';
export const PUZZLE_TITLE = `The Crooked Moon — Puzzle No. ${PUZZLE_NUMBER}`;

export const WORDS: WordDef[] = [
  { num: 1, dir: 'across', r: 0, c: 0, answer: 'ADELA', clue: "The love of Phillip Druskenvald's life." },
  { num: 1, dir: 'down', r: 0, c: 0, answer: 'AGNES', clue: 'The wife of man who fled into Wickermoor Forest and was torn apart before he could reach safety.' },
  { num: 2, dir: 'across', r: 0, c: 7, answer: 'JENKINS', clue: 'The caretaker family of Druskenvald Estate.' },
  { num: 3, dir: 'down', r: 0, c: 13, answer: 'STONOGA', clue: 'Given name of the hag who controls centipedes.' },
  { num: 4, dir: 'down', r: 0, c: 15, answer: 'HERALD', clue: "Wood-and-sinew messenger that has now spoken the Crooked Queen's name aloud twice." },
  { num: 5, dir: 'down', r: 2, c: 3, answer: 'JERGAL', clue: "Ancient entity who left a mark on one party member's neck." },
  { num: 6, dir: 'down', r: 2, c: 11, answer: 'BANJO', clue: "The instrument Foxwillow's guardian used to play for the fieldhands." },
  { num: 7, dir: 'down', r: 3, c: 8, answer: 'CROOKEDMAN', clue: "What Eustace Lockwood became after his daughter's death broke him." },
  { num: 8, dir: 'across', r: 4, c: 0, answer: 'STORY', clue: 'What the mysterious cat in the Crooked House library wants from anyone willing to give it one.' },
  { num: 9, dir: 'across', r: 4, c: 6, answer: 'VERMINTOLL', clue: 'The coven the weasel hag belongs to.' },
  { num: 10, dir: 'down', r: 5, c: 5, answer: 'ALDA', clue: 'Wickermoor innkeeper whose loyalty runs toward money and power, not people.' },
  { num: 11, dir: 'across', r: 6, c: 2, answer: 'CAULDRON', clue: "Fabled Heirloom inherited after a hag's death, prone to showing unsettling visions to whoever attunes to it." },
  { num: 12, dir: 'across', r: 8, c: 4, answer: 'PATIENTLADY', clue: 'The faith Sister Rain abandoned her entire village to follow.' },
  { num: 12, dir: 'down', r: 8, c: 4, answer: 'PETUNIA', clue: "She killed Gail Patrini, the house's own maid, and hid it from everyone for decades." },
  { num: 13, dir: 'down', r: 8, c: 12, answer: 'ADELAIDE', clue: "Martha Langtree's daughter." },
  { num: 14, dir: 'down', r: 9, c: 1, answer: 'AMBARY', clue: 'The only one in the party who handled the carriage reins with ease on the first try.' },
  { num: 15, dir: 'across', r: 11, c: 6, answer: 'GRAYGULLET', clue: 'Surname of the hag who controls pigeons.' },
  { num: 16, dir: 'across', r: 13, c: 9, answer: 'JERICHO', clue: 'A former hero of Druskenvald turned guardian, now missing from Foxwillow Farmland.' },
  { num: 17, dir: 'across', r: 14, c: 0, answer: 'SYLVAN', clue: 'The language spoken by the towering, bark-skinned figure in Wickermoor Forest.' },
  { num: 18, dir: 'across', r: 15, c: 8, answer: 'LOTTERY', clue: "Founder's Round tradition, dressed up as a festival, that nearly cost Finneas Trout his life." },
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

export const OPEN_CELL_COUNT = 119;

/** Server-side authoritative scoring: counts words fully matching the solution. Never trust a client-reported word count. */
export function scoreLetters(letters: unknown): number {
  if (!Array.isArray(letters) || letters.length !== SIZE * SIZE) return 0;
  return WORDS.filter((w) => cellsOf(w).every((i, k) => letters[i] === w.answer[k])).length;
}
