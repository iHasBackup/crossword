import type { useCrossword } from '../useCrossword';

type Props = Pick<
  ReturnType<typeof useCrossword>,
  'name' | 'setName' | 'gateError' | 'ranked' | 'narrow' | 'onStart' | 'goBoard'
>;

export function Gate({ name, setName, gateError, ranked, narrow, onStart, goBoard }: Props) {
  const topThree = ranked.slice(0, 3);

  return (
    <div
      className="gate"
      style={{
        gridTemplateColumns: narrow ? 'minmax(0, 1fr)' : 'minmax(0, 1.1fr) minmax(0, 0.9fr)',
      }}
    >
      <div
        className="gate-left"
        style={
          narrow
            ? { borderBottom: '2px solid var(--color-divider)' }
            : { borderRight: '2px solid var(--color-divider)' }
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="kicker" style={{ color: 'var(--color-accent)' }}>
            Puzzle No. 01&nbsp;&nbsp;/&nbsp;&nbsp;16 words
          </div>
          <h1 className="gate-title">
            THE
            <br />
            CROOKED
            <br />
            MOON
          </h1>
          <div className="muted-60" style={{ fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            A campaign crossword
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 440 }}>
          <hr className="hr" style={{ margin: 0 }} />
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5, textWrap: 'pretty' }}>
            No hints, no checking, no account. Type a name, fill the grid, submit once. You are
            ranked by words solved first, then by time.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label
              className="muted-60"
              style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}
            >
              Name or Discord tag
            </label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <input
                className="input"
                style={{ flex: '1 1 210px', height: 46, fontSize: 15 }}
                placeholder="e.g. thornwick#0421"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onStart();
                }}
              />
              <button
                className="btn btn-primary"
                style={{ height: 46, padding: '0 22px' }}
                onClick={onStart}
              >
                Enter the hollow
              </button>
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-accent-700)', minHeight: 18 }}>
              {gateError}
            </div>
          </div>
          <button
            className="btn btn-ghost"
            style={{ alignSelf: 'flex-start', padding: 0 }}
            onClick={goBoard}
          >
            Skip to leaderboard &rarr;
          </button>
        </div>
      </div>
      <div className="gate-right">
        <div className="muted-60" style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
          Standing at the top
        </div>
        {topThree.map((row, i) => (
          <div className="gate-row" key={i}>
            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 800,
                fontSize: 24,
                color: 'var(--color-accent)',
              }}
            >
              {row.rank}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 800,
                  fontSize: 17,
                  overflowWrap: 'anywhere',
                }}
              >
                {row.name}
              </div>
              <div className="muted-60" style={{ fontSize: 12 }}>
                {row.wordsText}
              </div>
            </div>
            <div style={{ fontVariantNumeric: 'tabular-nums', fontSize: 16 }}>{row.timeText}</div>
          </div>
        ))}
        <div className="muted-60" style={{ fontSize: 12, lineHeight: 1.5, paddingTop: 8 }}>
          Ranked by the shared leaderboard.
        </div>
      </div>
    </div>
  );
}
