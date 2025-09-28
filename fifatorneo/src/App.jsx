import { useRef } from 'react';
import Bracket64SplitInteractive from './components/fixtures/bracket64SplitInteractive';
import LandingPage from './components/pages/landingpage';

export default function App() {
  const ref = useRef(null);

  const seedNow = () => {
    const players = Array.from({ length: 64 }, (_, i) => `Player ${i + 1}`);
    ref.current?.seed(players);
  };

  const quickDemo = () => {
    ref.current?.reset();
    ref.current?.addPlayerAt(0, 'Alex');
    ref.current?.addPlayerAt(1, 'Sam');
    ref.current?.wonFirstRound(0, 0); // match 0, top wins
  };

  return (
    <div style={{ padding: 16 }}>
      <h1>FIFA Tournament</h1>

      <LandingPage />
    </div>
  );
}

/*
  <Bracket64SplitInteractive
        ref={ref}
        autoSeed={false}
        showConnectors
        exposeOnWindow={import.meta.env.DEV}  // only expose window API in dev
      />
*/