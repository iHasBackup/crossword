import { useEffect, useRef, useState } from 'react';
import type { useCrossword } from '../useCrossword';
import { SIZE } from '../puzzle';

const MAX_GRID_PX = 484;

type Props = Pick<
  ReturnType<typeof useCrossword>,
  | 'sol'
  | 'nums'
  | 'letters'
  | 'active'
  | 'activeWordCells'
  | 'inputs'
  | 'onCellChange'
  | 'onCellKey'
  | 'onCellFocus'
  | 'onCellMouseDown'
>;

export function Grid({
  sol,
  nums,
  letters,
  active,
  activeWordCells,
  inputs,
  onCellChange,
  onCellKey,
  onCellFocus,
  onCellMouseDown,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(MAX_GRID_PX);

  // Measuring the wrapper and setting width/height to the same integer
  // pixel value (rather than leaning on `aspect-ratio`, which some
  // browsers resolve inconsistently against fr-unit grid tracks) is what
  // actually guarantees identical column/row sizing — same math, same
  // input, on both axes.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setSize(Math.min(MAX_GRID_PX, Math.floor(el.clientWidth)));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const cells = [];
  for (let i = 0; i < SIZE * SIZE; i++) {
    const open = !!sol[i];
    const bg = !open
      ? 'var(--color-text)'
      : i === active
        ? 'var(--color-accent-200)'
        : activeWordCells.indexOf(i) !== -1
          ? 'var(--color-accent-100)'
          : '#ffffff';
    cells.push(
      <div className="cell" style={{ background: bg }} key={i}>
        {open && (
          <>
            <span className="cell-num muted-60">{nums[i]}</span>
            <input
              className="cell-input"
              value={letters[i] || ''}
              onChange={(e) => onCellChange(i, e.target.value)}
              onKeyDown={(e) => onCellKey(i, e)}
              onFocus={() => onCellFocus(i)}
              onMouseDown={() => onCellMouseDown(i)}
              ref={(el) => {
                inputs.current[i] = el;
              }}
              autoComplete="off"
              autoCapitalize="characters"
              autoCorrect="off"
              inputMode="text"
              spellCheck={false}
              aria-label={`Row ${Math.floor(i / SIZE) + 1} column ${(i % SIZE) + 1}`}
            />
          </>
        )}
      </div>,
    );
  }

  return (
    <div ref={wrapRef} style={{ width: '100%', maxWidth: MAX_GRID_PX }}>
      <div
        className="grid"
        style={{
          width: size,
          height: size,
          gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${SIZE}, minmax(0, 1fr))`,
        }}
      >
        {cells}
      </div>
    </div>
  );
}
