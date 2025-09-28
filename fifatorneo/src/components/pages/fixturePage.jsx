import { useRef } from 'react';
import Bracket64SplitInteractive from '../fixtures/bracket64SplitInteractive';

export default function FixturesPage() {
    const bracketRef = useRef(null);

    const seedNow = () => {
        const players = Array.from({ length: 64 }, (_, i) => `Player ${i + 1}`);
        bracketRef.current?.seed(players);
    };

    const quickDemo = () => {
        bracketRef.current?.reset();
        bracketRef.current?.addPlayerAt(0, 'Alex');
        bracketRef.current?.addPlayerAt(1, 'Sam');
        bracketRef.current?.wonFirstRound(0, 0); // match 0, top wins
    };

    return (
        <div style={{ padding: 16 }}>
            <h1 style={{ margin: '0 0 12px' }}>Fixtures</h1>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '12px 0 20px' }}>
                <button onClick={seedNow}>Seed 64</button>
                <button onClick={quickDemo}>Quick demo</button>
                <button onClick={() => bracketRef.current?.reset()}>Reset</button>
            </div>

            <Bracket64SplitInteractive
                ref={bracketRef}
                autoSeed={false}
                showConnectors
                exposeOnWindow={import.meta.env?.DEV ?? process.env.NODE_ENV !== 'production'}
            />
        </div>
    );
}
