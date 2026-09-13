import type { ReactElement } from 'react';
import CrookedMoonCrossword from './App';

export interface Campaign {
  slug: string;
  path: string;
  label: string;
  element: ReactElement;
}

// Add a new campaign here when it exists — one entry, one route. The
// landing redirect below always points at the first entry until there's
// more than one, at which point it should become a campaign picker instead.
export const CAMPAIGNS: Campaign[] = [
  {
    slug: 'crookedmoon',
    path: '/crookedmoon/crossword',
    label: 'The Crooked Moon',
    element: <CrookedMoonCrossword />,
  },
];
