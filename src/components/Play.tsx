import type { useCrossword } from '../useCrossword';
import { WORDS, PUZZLE_TITLE, type WordDef, type Direction } from '../puzzle';
import { Grid } from './Grid';
import { fmtTime } from '../useCrossword';

type Props = ReturnType<typeof useCrossword>;

export function Play(props: Props) {
  const {
    name,
    elapsed,
    filled,
    total,
    narrow,
    activeWord,
    solvedWords,
    goBoard,
    onFlipDir,
    onPrevWord,
    onNextWord,
    onSubmit,
    onClear,
    dir,
    selectWord,
  } = props;

  return (
    <div>
      <div className="nav play-header" style={{ flexWrap: 'wrap', rowGap: 8 }}>
        <div className="nav-brand" style={{ fontSize: 'clamp(15px, 3.4vw, 18px)' }}>
          {PUZZLE_TITLE}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <span className="muted-60" style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Player
          </span>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800 }}>{name}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="muted-60" style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Time
          </span>
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: 20,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {fmtTime(elapsed)}
          </span>
        </div>
        <span className="tag tag-outline">
          {filled} / {total} letters
        </span>
        <button className="btn btn-secondary" onClick={goBoard}>
          Leaderboard
        </button>
      </div>

      <div
        className="play-body"
        style={{
          gridTemplateColumns: narrow ? 'minmax(0, 1fr)' : 'minmax(0, 548px) minmax(0, 1fr)',
        }}
      >
        <div
          className="play-left"
          style={
            narrow
              ? { borderBottom: '2px solid var(--color-divider)' }
              : { borderRight: '2px solid var(--color-divider)' }
          }
        >
          <Grid
            sol={props.sol}
            nums={props.nums}
            letters={props.letters}
            active={props.active}
            activeWordCells={props.activeWordCells}
            inputs={props.inputs}
            onCellChange={props.onCellChange}
            onCellKey={props.onCellKey}
            onCellFocus={props.onCellFocus}
            onCellMouseDown={props.onCellMouseDown}
          />

          <div className="active-clue">
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 800,
                  fontSize: 13,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'var(--color-accent)',
                  whiteSpace: 'nowrap',
                }}
              >
                {activeWord ? `${activeWord.num} ${activeWord.dir}` : ''}
              </span>
              <span style={{ fontSize: 15, lineHeight: 1.35, textWrap: 'pretty' }}>
                {activeWord ? activeWord.clue : 'Pick a square.'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                className="btn btn-secondary"
                style={{ height: 40, minWidth: 46 }}
                onClick={onPrevWord}
                aria-label="Previous clue"
              >
                &larr;
              </button>
              <button
                className="btn btn-secondary"
                style={{ height: 40, minWidth: 46 }}
                onClick={onNextWord}
                aria-label="Next clue"
              >
                &rarr;
              </button>
              <button className="btn btn-secondary" style={{ height: 40 }} onClick={onFlipDir}>
                {dir === 'across' ? 'Across' : 'Down'}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            <button className="btn btn-primary" style={{ height: 44, padding: '0 20px' }} onClick={onSubmit}>
              Submit result
            </button>
            <button className="btn btn-ghost" style={{ height: 44 }} onClick={onClear}>
              Clear grid
            </button>
            <span className="muted-60" style={{ fontSize: 12 }}>
              Arrows move · Space flips direction · Enter next clue
            </span>
          </div>
        </div>

        <div className="play-right">
          <ClueList
            title="Across"
            direction="across"
            activeWord={activeWord}
            solvedWords={solvedWords}
            onPick={selectWord}
          />
          <ClueList
            title="Down"
            direction="down"
            activeWord={activeWord}
            solvedWords={solvedWords}
            onPick={selectWord}
          />
        </div>
      </div>
    </div>
  );
}

function ClueList({
  title,
  direction,
  activeWord,
  solvedWords,
  onPick,
}: {
  title: string;
  direction: Direction;
  activeWord: Props['activeWord'];
  solvedWords: Props['solvedWords'];
  onPick: (w: WordDef) => void;
}) {
  const words = WORDS.filter((w) => w.dir === direction);
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="clue-list-heading">{title}</div>
      {words.map((w) => {
        const on = activeWord === w;
        const done = solvedWords.indexOf(w) !== -1;
        return (
          <button
            key={w.num}
            type="button"
            className="clue-row"
            style={{ background: on ? 'var(--color-accent-100)' : 'transparent' }}
            onClick={() => onPick(w)}
          >
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 800,
                fontSize: 13,
                color: on
                  ? 'var(--color-accent-700)'
                  : done
                    ? 'color-mix(in srgb, var(--color-text) 45%, transparent)'
                    : 'var(--color-text)',
              }}
            >
              {w.num}
            </span>
            <span style={{ fontSize: 14, lineHeight: 1.4, textWrap: 'pretty' }}>{w.clue}</span>
          </button>
        );
      })}
    </div>
  );
}
