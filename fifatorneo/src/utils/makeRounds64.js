// Build round-by-round structure for a 64-player single-elimination bracket.
// Output: rounds[0] has 32 matches, rounds[1] has 16, ..., rounds[5] has 1 final.
export function makeRounds64(playerNames) {
    if (!Array.isArray(playerNames) || playerNames.length !== 64) {
        throw new Error('Expected exactly 64 player names');
    }

    // Round sizes (matches per round)
    const sizes = [32, 16, 8, 4, 2, 1];

    // R1 matches: pair up players 0..63 into 32 matches
    const rounds = [];
    const r1 = [];
    for (let i = 0; i < 64; i += 2) {
        r1.push({
            id: `R1-M${i / 2 + 1}`,
            p1: { id: i + 1, name: playerNames[i] },
            p2: { id: i + 2, name: playerNames[i + 1] },
            winner: null, // you can fill this later (e.g., "p1" or "p2")
        });
    }
    rounds.push(r1);

    // Following rounds start empty (you can compute winners later if you want)
    for (let r = 1; r < sizes.length; r++) {
        const matchCount = sizes[r];
        const matches = [];
        for (let m = 0; m < matchCount; m++) {
            matches.push({
                id: `R${r + 1}-M${m + 1}`,
                p1: null, // will be winner of previous two matches
                p2: null,
                winner: null,
            });
        }
        rounds.push(matches);
    }

    return rounds;
}

// (Optional) helper to propagate winners forward if you later set match.winner = 'p1' | 'p2' in earlier rounds.
export function propagateWinners(rounds) {
    for (let r = 1; r < rounds.length; r++) {
        const prev = rounds[r - 1];
        const curr = rounds[r];
        for (let i = 0; i < curr.length; i++) {
            const m1 = prev[i * 2];
            const m2 = prev[i * 2 + 1];

            const w1 =
                m1 && m1.winner === 'p2' ? m1.p2 :
                    m1 && m1.winner === 'p1' ? m1.p1 :
                        null;

            const w2 =
                m2 && m2.winner === 'p2' ? m2.p2 :
                    m2 && m2.winner === 'p1' ? m2.p1 :
                        null;

            curr[i].p1 = w1;
            curr[i].p2 = w2;
        }
    }
    return rounds;
}
