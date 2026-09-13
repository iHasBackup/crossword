import type { useCrossword } from '../useCrossword';
import { WORDS, PUZZLE_TITLE, cellsOf } from '../puzzle';
import { fmtTime } from '../useCrossword';

type Props = ReturnType<typeof useCrossword>;

export function Board(props: Props) {
  const { name, ranked, lastRun, letters, narrow, goPlay, onPlayAgain, onSwitchPlayer } = props;

  return (
    <div>
      <div className="nav" style={{ flexWrap: 'wrap', rowGap: 8 }}>
        <div className="nav-brand">Leaderboard</div>
        <span className="tag tag-accent">{PUZZLE_TITLE}</span>
        <button className="btn btn-secondary" onClick={goPlay}>
          {name ? 'Back to the grid' : 'Start a run'}
        </button>
      </div>
      <div
        className="board-body"
        style={{
          gridTemplateColumns: narrow ? 'minmax(0, 1fr)' : 'minmax(0, 2fr) minmax(240px, 1fr)',
        }}
      >
        <div style={{ minWidth: 0, overflowX: 'auto' }}>
          <table className="table" style={{ minWidth: 320 }}>
            <thead>
              <tr>
                <th style={{ width: 44 }}>#</th>
                <th>Player</th>
                <th style={{ width: 100 }}>Words</th>
                <th style={{ width: 90 }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((row, i) => (
                <tr
                  key={i}
                  style={{
                    background: lastRun && row.raw === lastRun ? 'var(--color-accent-100)' : 'transparent',
                  }}
                >
                  <td
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 800,
                      color: row.rank === '01' ? 'var(--color-accent)' : 'var(--color-text)',
                    }}
                  >
                    {row.rank}
                  </td>
                  <td style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, overflowWrap: 'anywhere' }}>
                    {row.name}
                  </td>
                  <td style={{ fontVariantNumeric: 'tabular-nums' }}>{row.wordsText}</td>
                  <td style={{ fontVariantNumeric: 'tabular-nums' }}>{row.timeText}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="muted-60" style={{ fontSize: 12, paddingTop: 14 }}>
            Ranked by words solved, then by time. Scores are shared across all players.
          </div>
        </div>
        <div className="results-sidebar">
          <div className="kicker" style={{ color: 'var(--color-accent)' }}>
            Your last run
          </div>
          <div
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: 34,
              lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {lastRun ? fmtTime(lastRun.time) : '--:--'}
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.45 }}>
            {lastRun
              ? `${lastRun.words} of ${WORDS.length} words solved as ${lastRun.name}.`
              : 'Nothing submitted yet this session.'}
          </div>
          {lastRun && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, paddingTop: 6 }}>
              <div
                className="muted-60"
                style={{
                  fontSize: 11,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  paddingBottom: 6,
                  borderBottom: '2px solid var(--color-divider)',
                }}
              >
                Answer key
              </div>
              {WORDS.map((w) => {
                const ok = cellsOf(w).every((i, k) => letters[i] === w.answer[k]);
                return (
                  <div className="answer-key-row" key={`${w.dir}-${w.num}`}>
                    <span className="muted-60" style={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      {w.num}
                      {w.dir === 'across' ? 'A' : 'D'}
                    </span>
                    <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, letterSpacing: '0.04em' }}>
                      {ok ? w.answer : ''}
                    </span>
                    <span
                      style={{
                        fontWeight: 800,
                        color: ok ? 'var(--color-accent)' : 'color-mix(in srgb, var(--color-text) 40%, transparent)',
                      }}
                    >
                      {ok ? '✓' : '·'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          <hr className="hr" style={{ margin: '4px 0' }} />
          <button className="btn btn-primary" style={{ height: 42 }} onClick={onPlayAgain}>
            Play again
          </button>
          <button className="btn btn-ghost" style={{ padding: 0, alignSelf: 'flex-start' }} onClick={onSwitchPlayer}>
            Change name
          </button>
        </div>
      </div>
    </div>
  );
}
