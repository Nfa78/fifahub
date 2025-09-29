import { useRef } from 'react';
import Bracket64SplitInteractive from '../fixtures/bracket64SplitInteractive';
import './stlyes/fixtures.css'
import { useNavigate } from 'react-router';
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
    const navigate = useNavigate();
    return (
        <div style={{ padding: 35, paddingLeft: 45, backgroundColor: "#0b0d14" }}>
            <button onClick={() => navigate("/")} className="btn btn--ghost">
                Homepage
            </button>
            <Bracket64SplitInteractive
                ref={bracketRef}
                autoSeed={false}
                showConnectors
                exposeOnWindow={import.meta.env?.DEV ?? process.env.NODE_ENV !== 'production'}
            />
        </div>
    );
}
