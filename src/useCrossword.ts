import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SIZE, WORDS, idx, cellsOf, buildSolution, type Direction } from './puzzle';
import type { Score, View } from './types';
import { fetchScores, submitScore, ApiError } from './api';

const { sol, nums } = buildSolution();

export function fmtTime(s: number): string {
  const m = Math.floor(s / 60);
  const x = s % 60;
  return String(m).padStart(2, '0') + ':' + String(x).padStart(2, '0');
}

function emptyLetters(): string[] {
  return new Array(SIZE * SIZE).fill('');
}

export function useCrossword() {
  const [view, setView] = useState<View>('gate');
  const [name, setName] = useState('');
  const [gateError, setGateError] = useState('');
  const [letters, setLetters] = useState<string[]>(emptyLetters);
  const [active, setActive] = useState(idx(0, 0));
  const [dir, setDir] = useState<Direction>('across');
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [scores, setScores] = useState<Score[]>([]);
  const [lastRun, setLastRun] = useState<Score | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [narrow, setNarrow] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 860 : false,
  );

  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  // Initial + periodic score fetch (shared, server-backed leaderboard).
  useEffect(() => {
    let cancelled = false;
    fetchScores()
      .then((s) => {
        if (!cancelled) setScores(s);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Timer
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  // Responsive breakpoint
  useEffect(() => {
    const onResize = () => setNarrow(window.innerWidth < 860);
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const focusCell = useCallback((i: number) => {
    setActive(i);
    const el = inputs.current[i];
    if (el) {
      el.focus();
      try {
        el.setSelectionRange(1, 1);
      } catch {
        /* not all input types support selection ranges */
      }
    }
  }, []);

  const step = useCallback((i: number, d: Direction, delta: number): number | null => {
    let r = Math.floor(i / SIZE);
    let c = i % SIZE;
    for (let n = 0; n < SIZE; n++) {
      if (d === 'across') c += delta;
      else r += delta;
      if (r < 0 || c < 0 || r >= SIZE || c >= SIZE) return null;
      if (sol[idx(r, c)]) return idx(r, c);
    }
    return null;
  }, []);

  const put = useCallback((i: number, ch: string) => {
    setLetters((prev) => {
      const next = prev.slice();
      next[i] = ch;
      return next;
    });
    if (ch !== '') setRunning((r) => r || true);
  }, []);

  const wordAt = useCallback((i: number, d: Direction) => {
    return WORDS.find((w) => w.dir === d && cellsOf(w).indexOf(i) !== -1) ?? null;
  }, []);

  const activeWord = useMemo(() => {
    return wordAt(active, dir) ?? wordAt(active, dir === 'across' ? 'down' : 'across');
  }, [active, dir, wordAt]);

  const activeWordCells = useMemo(() => (activeWord ? cellsOf(activeWord) : []), [activeWord]);

  const solvedWords = useMemo(
    () => WORDS.filter((w) => cellsOf(w).every((i, k) => letters[i] === w.answer[k])),
    [letters],
  );

  const jumpWord = useCallback(
    (delta: number) => {
      const at = activeWord ? WORDS.indexOf(activeWord) : 0;
      const nw = WORDS[(at + delta + WORDS.length) % WORDS.length];
      setDir(nw.dir);
      focusCell(idx(nw.r, nw.c));
    },
    [activeWord, focusCell],
  );

  const onCellKey = useCallback(
    (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      const k = e.key;
      if (k === 'Backspace') {
        e.preventDefault();
        if (letters[i]) {
          put(i, '');
          return;
        }
        const prev = step(i, dir, -1);
        if (prev !== null) {
          put(prev, '');
          focusCell(prev);
        }
        return;
      }
      if (k === 'Delete') {
        e.preventDefault();
        put(i, '');
        return;
      }
      if (k === ' ') {
        e.preventDefault();
        setDir((d) => (d === 'across' ? 'down' : 'across'));
        return;
      }
      if (k === 'Enter' || k === 'Tab') {
        e.preventDefault();
        jumpWord(e.shiftKey ? -1 : 1);
        return;
      }
      const map: Record<string, [Direction, number]> = {
        ArrowLeft: ['across', -1],
        ArrowRight: ['across', 1],
        ArrowUp: ['down', -1],
        ArrowDown: ['down', 1],
      };
      if (map[k]) {
        e.preventDefault();
        const [d, delta] = map[k];
        if (dir !== d) setDir(d);
        const n = step(i, d, delta);
        if (n !== null) focusCell(n);
        return;
      }
      if (/^[a-zA-Z]$/.test(k)) {
        e.preventDefault();
        put(i, k.toUpperCase());
        const n = step(i, dir, 1);
        if (n !== null) focusCell(n);
      }
    },
    [letters, dir, put, step, focusCell, jumpWord],
  );

  const onCellChange = useCallback(
    (i: number, raw: string) => {
      const v = (raw || '').replace(/[^a-zA-Z]/g, '');
      if (!v) {
        put(i, '');
        return;
      }
      const ch = v[v.length - 1].toUpperCase();
      put(i, ch);
      const n = step(i, dir, 1);
      if (n !== null) focusCell(n);
    },
    [put, step, dir, focusCell],
  );

  const onCellMouseDown = useCallback(
    (i: number) => {
      if (active === i) setDir((d) => (d === 'across' ? 'down' : 'across'));
    },
    [active],
  );

  const onCellFocus = useCallback(
    (i: number) => {
      if (active !== i) setActive(i);
    },
    [active],
  );

  const onFlipDir = useCallback(() => setDir((d) => (d === 'across' ? 'down' : 'across')), []);
  const onPrevWord = useCallback(() => jumpWord(-1), [jumpWord]);
  const onNextWord = useCallback(() => jumpWord(1), [jumpWord]);

  const selectWord = useCallback(
    (w: { dir: Direction; r: number; c: number }) => {
      setDir(w.dir);
      focusCell(idx(w.r, w.c));
    },
    [focusCell],
  );

  const onStart = useCallback(() => {
    const n = name.trim();
    if (n.length < 2) {
      setGateError('Give me at least two characters.');
      return;
    }
    setName(n);
    setGateError('');
    setView('play');
    setTimeout(() => focusCell(idx(0, 0)), 80);
  }, [name, focusCell]);

  const onClear = useCallback(() => setLetters(emptyLetters()), []);
  const goBoard = useCallback(() => setView('board'), []);
  const goPlay = useCallback(() => setView(name ? 'play' : 'gate'), [name]);

  const onSubmit = useCallback(async () => {
    const run: Score = { name: name || 'anonymous', words: solvedWords.length, time: elapsed };
    setRunning(false);
    setLastRun(run);
    setView('board');
    setSubmitError(null);
    // Optimistic: show the run immediately, reconcile with the server's
    // authoritative (server-scored) tally on the next fetch.
    setScores((prev) => prev.concat([run]));
    try {
      const saved = await submitScore(run.name, letters, run.time);
      setLastRun(saved);
      const fresh = await fetchScores();
      setScores(fresh);
    } catch (err) {
      if (err instanceof ApiError) {
        // The server actually rejected this run (bad input, rate limit,
        // storage error) — it was never saved, so don't leave a phantom
        // row in the leaderboard pretending it was.
        setScores((prev) => prev.filter((s) => s !== run));
        setSubmitError(err.message);
      }
      // Anything else is a network-level failure (offline, etc): the
      // optimistic entry stands and reconciles on the next successful fetch.
    }
  }, [name, solvedWords, elapsed, letters]);

  const onPlayAgain = useCallback(() => {
    if (!name) {
      setView('gate');
      return;
    }
    setView('play');
    setLetters(emptyLetters());
    setElapsed(0);
    setRunning(false);
    setActive(idx(0, 0));
    setDir('across');
    setSubmitError(null);
  }, [name]);

  const onSwitchPlayer = useCallback(() => {
    setView('gate');
    setGateError('');
    setSubmitError(null);
  }, []);

  const ranked = useMemo(() => {
    return scores
      .slice()
      .sort((a, b) => b.words - a.words || a.time - b.time)
      .map((r, n) => ({
        raw: r,
        rank: String(n + 1).padStart(2, '0'),
        name: r.name,
        wordsText: `${r.words} / ${WORDS.length}`,
        timeText: fmtTime(r.time),
      }));
  }, [scores]);

  const filled = useMemo(() => letters.filter((l, i) => l && sol[i]).length, [letters]);
  const total = useMemo(() => sol.filter(Boolean).length, []);

  return {
    view,
    name,
    setName,
    gateError,
    letters,
    active,
    dir,
    elapsed,
    running,
    narrow,
    sol,
    nums,
    inputs,
    activeWord,
    activeWordCells,
    solvedWords,
    ranked,
    lastRun,
    submitError,
    filled,
    total,
    focusCell,
    onCellKey,
    onCellChange,
    onCellMouseDown,
    onCellFocus,
    onFlipDir,
    onPrevWord,
    onNextWord,
    selectWord,
    onStart,
    onClear,
    goBoard,
    goPlay,
    onSubmit,
    onPlayAgain,
    onSwitchPlayer,
  };
}
