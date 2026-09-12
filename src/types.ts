export type View = 'gate' | 'play' | 'board';

export interface Score {
  name: string;
  words: number;
  time: number;
  createdAt?: string;
}
