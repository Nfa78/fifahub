// bracketOps.js

/**
 * State shape:
 * {
 *   leftRounds:  [ [ {id, p1, p2}, ... ],  // r=0 (32 players = 16 matches)
 *                  [ ... ],                 // r=1 (8 matches)
 *                  [ ... ],                 // r=2 (4 matches)
 *                  [ ... ],                 // r=3 (2 matches)
 *                  [ ... ] ]                // r=4 (1 match, the left finalist)
 *   rightRounds: [ same for right side, mirrored ],
 *   final: { left: null|{id,name}, right: null|{id,name}, winner: null|{id,name} }
 * }
 *
 * Notes:
 * - We only move names forward; we don't erase losers. Adjust as you prefer.
 * - "id" of players can be null; we primarily carry { name } for simplicity.
 */

/** Deep-ish clone rounds (arrays of arrays of objects) */
function cloneRounds(rounds) {
    return rounds.map(r =>
        r.map(m => ({
            id: m.id,
            p1: m.p1 ? { ...m.p1 } : null,
            p2: m.p2 ? { ...m.p2 } : null,
        }))
    );
}

/** Create an initial empty split bracket (left/right halves) for 32 per side */
export function createEmptySplitBracket() {
    const buildEmptyRounds = () => {
        const rounds = [];
        let matches = 16; // r=0 for 32 players
        let id = 0;
        for (let r = 0; r < 5; r++) { // 32->16->8->4->2
            const arr = [];
            for (let i = 0; i < matches; i++) {
                arr.push({ id: `m-${id++}`, p1: null, p2: null });
            }
            rounds.push(arr);
            matches = matches / 2;
        }
        return rounds;
    };

    return {
        leftRounds: buildEmptyRounds(),
        rightRounds: buildEmptyRounds(),
        final: { left: null, right: null, winner: null },
    };
}

/**
 * Add/Replace a player at leaf index 0..63.
 * 0..31  → left side first-round leaves (top→bottom),
 * 32..63 → right side first-round leaves (top→bottom).
 * Index maps to (matchIndex = floor(k/2), slot = k%2).
 *
 * @param state bracket state
 * @param index 0..63
 * @param player {id?, name} or string (name)
 * @returns new state
 */
export function addPlayerAt(state, index, player) {
    const pObj = typeof player === 'string' ? { id: null, name: player } : player;
    if (index < 0 || index > 63) throw new Error('index must be 0..63');

    const leftRounds = cloneRounds(state.leftRounds);
    const rightRounds = cloneRounds(state.rightRounds);
    const final = { ...state.final };

    if (index <= 31) {
        // left side
        const k = index;
        const matchIdx = Math.floor(k / 2);
        const slot = k % 2; // 0 → p1, 1 → p2
        if (!leftRounds[0][matchIdx]) throw new Error('left match idx out of range');
        if (slot === 0) leftRounds[0][matchIdx].p1 = pObj;
        else leftRounds[0][matchIdx].p2 = pObj;
    } else {
        // right side
        const k = index - 32;
        const matchIdx = Math.floor(k / 2);
        const slot = k % 2;
        if (!rightRounds[0][matchIdx]) throw new Error('right match idx out of range');
        if (slot === 0) rightRounds[0][matchIdx].p1 = pObj;
        else rightRounds[0][matchIdx].p2 = pObj;
    }

    return { leftRounds, rightRounds, final };
}

/**
 * Advance a winner within a half.
 *
 * @param halfRounds rounds array for left or right
 * @param r round index (0..4)
 * @param i match index within round r
 * @param winnerSlot 0 for p1, 1 for p2 (which player in the match won)
 * @returns mutated halfRounds (same ref) for convenience
 */
function advanceWinnerInHalf(halfRounds, r, i, winnerSlot) {
    const match = halfRounds[r][i];
    if (!match) throw new Error('match not found in half');

    const winner =
        winnerSlot === 0 ? match.p1 :
            winnerSlot === 1 ? match.p2 :
                null;

    if (!winner) return halfRounds; // nothing to advance

    if (r < 4) {
        // move to next round within the half
        const nextMatchIdx = Math.floor(i / 2);
        const nextSlot = i % 2; // even i → p1, odd i → p2
        if (!halfRounds[r + 1][nextMatchIdx]) throw new Error('next match not found in half');
        if (nextSlot === 0) halfRounds[r + 1][nextMatchIdx].p1 = winner;
        else halfRounds[r + 1][nextMatchIdx].p2 = winner;
    }
    // if r===4, this winner is the half-finalist; caller will place into final
    return halfRounds;
}

/**
 * Mark a winner in the FIRST ROUND using a global match index 0..31
 * 0..15 → left side first-round matches (top→bottom)
 * 16..31 → right side first-round matches (top→bottom)
 *
 * @param state bracket state
 * @param matchIndex 0..31
 * @param playerIndex 0|1 (0 = top name in that match, 1 = bottom)
 * @returns new state with the winner propagated forward in that half
 */
export function wonFirstRound(state, matchIndex, playerIndex) {
    if (matchIndex < 0 || matchIndex > 31) throw new Error('matchIndex must be 0..31');
    if (playerIndex !== 0 && playerIndex !== 1) throw new Error('playerIndex must be 0 or 1');

    const leftRounds = cloneRounds(state.leftRounds);
    const rightRounds = cloneRounds(state.rightRounds);
    const final = { ...state.final };

    if (matchIndex <= 15) {
        // left side r=0
        const i = matchIndex;
        advanceWinnerInHalf(leftRounds, 0, i, playerIndex);
    } else {
        // right side r=0
        const i = matchIndex - 16;
        advanceWinnerInHalf(rightRounds, 0, i, playerIndex);
    }

    return { leftRounds, rightRounds, final };
}

/**
 * Generic "won" API: pick a side ('L'|'R'), a round r, a match i, and the slot 0|1.
 * This advances within the half and, if r===4, also fills the center final slot.
 *
 * @param state bracket state
 * @param side 'L' | 'R'
 * @param r round index in that half (0..4)
 * @param i match index in that round
 * @param playerIndex 0|1 (winner slot within the match)
 * @returns new state with propagation (and final updated when applicable)
 */
export function wonGeneric(state, side, r, i, playerIndex) {
    const leftRounds = cloneRounds(state.leftRounds);
    const rightRounds = cloneRounds(state.rightRounds);
    const final = { ...state.final };

    if (side === 'L') {
        advanceWinnerInHalf(leftRounds, r, i, playerIndex);
        // if left finalist decided:
        if (r === 4) {
            const m = leftRounds[4][0];
            final.left = playerIndex === 0 ? m.p1 : m.p2;
        }
    } else if (side === 'R') {
        advanceWinnerInHalf(rightRounds, r, i, playerIndex);
        if (r === 4) {
            const m = rightRounds[4][0];
            final.right = playerIndex === 0 ? m.p1 : m.p2;
        }
    } else {
        throw new Error("side must be 'L' or 'R'");
    }

    // If both finalists present, you could auto-fill final.winner later when final is played.
    return { leftRounds, rightRounds, final };
}

/**
 * Mark the center final winner.
 * @param state bracket state
 * @param side 'L' | 'R' (which finalist won)
 * @returns new state with final.winner set
 */
export function wonFinal(state, side) {
    const leftRounds = cloneRounds(state.leftRounds);
    const rightRounds = cloneRounds(state.rightRounds);
    const final = { ...state.final };

    if (side === 'L') final.winner = final.left ?? null;
    else if (side === 'R') final.winner = final.right ?? null;
    else throw new Error("side must be 'L' or 'R'");

    return { leftRounds, rightRounds, final };
}
