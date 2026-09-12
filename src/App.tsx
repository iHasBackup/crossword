import { useCrossword } from './useCrossword';
import { Gate } from './components/Gate';
import { Play } from './components/Play';
import { Board } from './components/Board';

export default function App() {
  const game = useCrossword();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
      {game.view === 'gate' && (
        <Gate
          name={game.name}
          setName={game.setName}
          gateError={game.gateError}
          ranked={game.ranked}
          narrow={game.narrow}
          onStart={game.onStart}
          goBoard={game.goBoard}
        />
      )}
      {game.view === 'play' && <Play {...game} />}
      {game.view === 'board' && <Board {...game} />}
    </div>
  );
}
