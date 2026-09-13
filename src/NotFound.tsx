import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: 16,
        padding: 'clamp(28px, 5vw, 56px) clamp(20px, 4vw, 48px)',
      }}
    >
      <div className="kicker" style={{ color: 'var(--color-accent)' }}>
        404
      </div>
      <h1 style={{ margin: 0, fontSize: 'clamp(28px, 4vw, 44px)' }}>Nothing at this address.</h1>
      <Link to="/crookedmoon/crossword" className="btn btn-primary" style={{ height: 44, padding: '0 20px' }}>
        Go to The Crooked Moon
      </Link>
    </div>
  );
}
