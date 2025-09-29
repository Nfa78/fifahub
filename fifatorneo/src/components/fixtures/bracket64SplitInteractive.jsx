import React, {
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
    forwardRef,
} from 'react';
import './styles/bracket.css';

import {
    createEmptySplitBracket,
    addPlayerAt as addPlayerAtOp,
    wonFirstRound as wonFirstRoundOp,
    wonGeneric as wonGenericOp,
    wonFinal as wonFinalOp,
} from '../../utils/bracketOps';

// ── Layout constants (same as your current file) ─────────────────────────────
const LEFT_COLS = 5;
const RIGHT_COLS = 5;
const FINAL_COLS = 1;
const COLS = LEFT_COLS + FINAL_COLS + RIGHT_COLS;

const BASE_ROWS_32 = 32;
const ROW_STEP = 2;
const TOP_ROWS = 4;
const HEADER_ROWS = TOP_ROWS * ROW_STEP;

const COL_WIDTH = 112;
const ROW_HEIGHT = 18;
const MATCH_ROW_SPAN = 2;
const H_GAP = 16;

const roundNamesLeft = ['Round of 32', 'Round of 16', 'Quarterfinals', 'Semifinal', 'Finalist'];
const roundNamesRight = ['Round of 32', 'Round of 16', 'Quarterfinals', 'Semifinal', 'Finalist'];

// ── Inline layout styles (kept minimal as before) ────────────────────────────
const styles = {
    container: {
        width: '100%',
        overflowX: 'auto',
        padding: '16px',
        boxSizing: 'border-box',
    },
    grid: (rows) => ({
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: `repeat(${COLS}, ${COL_WIDTH}px)`,
        gridTemplateRows: `repeat(${rows + HEADER_ROWS}, ${ROW_HEIGHT}px)`,
        gap: `0px ${H_GAP}px`,
        minWidth: `${COLS * (COL_WIDTH + H_GAP)}px`,
    }),
    roundHeader: (col, spanRows) => ({
        gridColumn: `${col} / span 1`,
        gridRow: `1 / span ${spanRows}`,
        fontWeight: 700,
        padding: '0 4px 8px 4px',
        position: 'sticky',
        top: 0,
        background: 'linear-gradient(180deg, rgba(17,24,39,0.85), rgba(17,24,39,0.0))',
        color: '#E5E7EB',
        zIndex: 2,
    }),
    matchWrap: (colStart, rowStart) => ({
        gridColumn: `${colStart} / span 1`,
        gridRow: `${rowStart} / span ${MATCH_ROW_SPAN}`,
    }),
    empty: { color: '#9CA3AF', fontStyle: 'italic' },
    connectors: (rows) => ({
        position: 'absolute',
        left: 0,
        top: 16,
        width: `${COLS * (COL_WIDTH + H_GAP)}px`,
        height: `${(rows + HEADER_ROWS) * ROW_HEIGHT}px`,
        pointerEvents: 'none',
        overflow: 'visible',
        zIndex: 1,
    }),
};

// ── Grid math (same as before) ───────────────────────────────────────────────
function gridPlacementHalf({ r, i, colBase, dir }) {
    const stride = 2 ** (r + 1);
    const offset = 2 ** r;
    const logicalRow = 1 + i * stride + offset;
    const rowStart = HEADER_ROWS + logicalRow * ROW_STEP;
    const colStart = colBase + dir * r;
    return { colStart, rowStart };
}
function gridPlacementFinal() {
    const logicalRow = 17; // aligns with finalists
    const rowStart = HEADER_ROWS + logicalRow * ROW_STEP;
    const colStart = LEFT_COLS + 1;
    return { colStart, rowStart };
}
function cellCenterPx({ colStart, rowStart }) {
    const xLeft = (colStart - 1) * (COL_WIDTH + H_GAP);
    const xCenter = xLeft + COL_WIDTH / 2;
    const yTop = (rowStart - 1) * ROW_HEIGHT;
    const yCenter = yTop + (MATCH_ROW_SPAN * ROW_HEIGHT) / 2;
    return { xLeft, xRight: xLeft + COL_WIDTH, xCenter, yCenter };
}

// ── Connectors overlay (renders from state) ──────────────────────────────────
function Connectors({ leftRounds, rightRounds, rowsTotal }) {
    const paths = [];

    // Left side → right
    for (let r = 0; r < leftRounds.length - 1; r++) {
        const curr = leftRounds[r];
        for (let i = 0; i < curr.length; i++) {
            const srcPos = gridPlacementHalf({ r, i, colBase: 1, dir: +1 });
            const dstPos = gridPlacementHalf({ r: r + 1, i: Math.floor(i / 2), colBase: 1, dir: +1 });

            const src = cellCenterPx(srcPos);
            const dst = cellCenterPx(dstPos);
            const x1 = src.xRight, y1 = src.yCenter;
            const x2 = dst.xLeft, y2 = dst.yCenter;
            const xMid = x1 + Math.max(8, (x2 - x1) * 0.35);
            paths.push(`M ${x1} ${y1} H ${xMid} V ${y2} H ${x2}`);
        }
    }

    // Right side → left
    for (let r = 0; r < rightRounds.length - 1; r++) {
        const curr = rightRounds[r];
        for (let i = 0; i < curr.length; i++) {
            const srcPos = gridPlacementHalf({ r, i, colBase: COLS, dir: -1 });
            const dstPos = gridPlacementHalf({ r: r + 1, i: Math.floor(i / 2), colBase: COLS, dir: -1 });

            const src = cellCenterPx(srcPos);
            const dst = cellCenterPx(dstPos);
            const x1 = src.xLeft, y1 = src.yCenter;
            const x2 = dst.xRight, y2 = dst.yCenter;
            const xMid = x1 - Math.max(8, (x1 - x2) * 0.35);
            paths.push(`M ${x1} ${y1} H ${xMid} V ${y2} H ${x2}`);
        }
    }

    // Left finalist → Final
    {
        const leftFinalPos = gridPlacementHalf({ r: LEFT_COLS - 1, i: 0, colBase: 1, dir: +1 });
        const centerFinalPos = gridPlacementFinal();
        const src = cellCenterPx(leftFinalPos);
        const dst = cellCenterPx(centerFinalPos);
        const x1 = src.xRight, y1 = src.yCenter;
        const x2 = dst.xLeft, y2 = dst.yCenter;
        const xMid = x1 + Math.max(8, (x2 - x1) * 0.35);
        paths.push(`M ${x1} ${y1} H ${xMid} V ${y2} H ${x2}`);
    }

    // Right finalist → Final
    {
        const rightFinalPos = gridPlacementHalf({ r: RIGHT_COLS - 1, i: 0, colBase: COLS, dir: -1 });
        const centerFinalPos = gridPlacementFinal();
        const src = cellCenterPx(rightFinalPos);
        const dst = cellCenterPx(centerFinalPos);
        const x1 = src.xLeft, y1 = src.yCenter;
        const x2 = dst.xRight, y2 = dst.yCenter;
        const xMid = x1 - Math.max(8, (x1 - x2) * 0.35);
        paths.push(`M ${x1} ${y1} H ${xMid} V ${y2} H ${x2}`);
    }

    return (
        <svg style={styles.connectors(rowsTotal)}>
            {paths.map((d, idx) => (
                <path key={idx} d={d} fill="none" stroke="#374151" strokeWidth="2" />
            ))}
        </svg>
    );
}

// ── Main component with imperative API ───────────────────────────────────────
/**
 * Props:
 * - autoSeed?: boolean (seed with `players` on mount if provided)
 * - players?: string[] (length 64). If autoSeed, index 0..63 map as requested.
 * - exposeOnWindow?: boolean ('bracket' API on window for quick testing)
 */
const Bracket64SplitInteractive = forwardRef(function Bracket64SplitInteractive(
    { players, autoSeed = true, exposeOnWindow = false, showConnectors = true },
    ref
) {
    const [state, setState] = useState(() => createEmptySplitBracket());
    const rowsPerHalf = BASE_ROWS_32 * ROW_STEP;

    // Convenience: seed from props.players if asked
    useEffect(() => {
        if (!autoSeed) return;
        if (!Array.isArray(players) || players.length !== 64) return;
        setState((s) => {
            let next = s;
            for (let i = 0; i < 64; i++) {
                next = addPlayerAtOp(next, i, players[i]);
            }
            return next;
        });
    }, [players, autoSeed]);

    // Imperative API (callable from parent via ref)
    useImperativeHandle(ref, () => ({
        reset() {
            setState(createEmptySplitBracket());
        },
        seed(players64) {
            if (!Array.isArray(players64) || players64.length !== 64) {
                throw new Error('seed(players64): expected array length 64');
            }
            setState((s) => {
                let next = createEmptySplitBracket();
                for (let i = 0; i < 64; i++) {
                    next = addPlayerAtOp(next, i, players64[i]);
                }
                return next;
            });
        },
        addPlayerAt(index, player) {
            setState((s) => addPlayerAtOp(s, index, player));
        },
        wonFirstRound(matchIndex, playerIndex) {
            setState((s) => wonFirstRoundOp(s, matchIndex, playerIndex));
        },
        wonGeneric(side, r, i, playerIndex) {
            setState((s) => wonGenericOp(s, side, r, i, playerIndex));
        },
        wonFinal(side) {
            setState((s) => wonFinalOp(s, side));
        },
        // For debugging: get current state
        getState() {
            return state;
        },
    }), [state]);

    // Optional quick testing from DevTools:
    const once = useRef(false);
    // Put this inside Bracket64SplitInteractive (replace the old exposeOnWindow useEffect)
    useEffect(() => {
        if (!exposeOnWindow) return;
        // Safely attach/update the API on every render so it survives Strict Mode remounts.
        window.bracket = {
            reset: () => setState(createEmptySplitBracket()),
            seed: (arr) => {
                if (!Array.isArray(arr) || arr.length !== 64) {
                    console.error('seed expects array of length 64');
                    return;
                }
                setState(() => {
                    let next = createEmptySplitBracket();
                    for (let i = 0; i < 64; i++) next = addPlayerAtOp(next, i, arr[i]);
                    return next;
                });
            },
            addPlayerAt: (i, p) => setState((s) => addPlayerAtOp(s, i, p)),
            wonFirstRound: (m, pi) => setState((s) => wonFirstRoundOp(s, m, pi)),
            wonGeneric: (side, r, i, pi) => setState((s) => wonGenericOp(s, side, r, i, pi)),
            wonFinal: (side) => setState((s) => wonFinalOp(s, side)),
            getState: () => state,
        };
        // Optional: helpful log
        // eslint-disable-next-line no-console
        console.log('window.bracket API ready:', Object.keys(window.bracket));
    }, [exposeOnWindow, state]);


    const { leftRounds, rightRounds, final } = state;

    return (
        <div style={styles.container}>
            <div style={styles.grid(rowsPerHalf)}>
                {/* Left headers */}
                {roundNamesLeft.map((title, r) => (
                    <div key={`lh-${r}`} style={styles.roundHeader(1 + r, HEADER_ROWS)}>{title}</div>
                ))}
                {/* Center header */}
                <div style={styles.roundHeader(LEFT_COLS + 1, HEADER_ROWS)}>Final</div>
                {/* Right headers */}
                {roundNamesRight.map((title, r) => (
                    <div key={`rh-${r}`} style={styles.roundHeader(COLS - r, HEADER_ROWS)}>{title}</div>
                ))}

                {/* Connectors */}
                {showConnectors && (
                    <Connectors leftRounds={leftRounds} rightRounds={rightRounds} rowsTotal={rowsPerHalf} />
                )}

                {/* Left matches */}
                {leftRounds.map((matches, r) =>
                    matches.map((m, i) => {
                        const { colStart, rowStart } = gridPlacementHalf({ r, i, colBase: 1, dir: +1 });
                        return (
                            <div key={`L-${m.id}`} style={styles.matchWrap(colStart, rowStart)}>
                                <div className="bracket-card" tabIndex={0}>
                                    <div className="bracket-name">{m.p1 ? m.p1.name : <span style={styles.empty}>TBD</span>}</div>
                                    <div className="bracket-name">{m.p2 ? m.p2.name : <span style={styles.empty}>TBD</span>}</div>
                                </div>
                            </div>
                        );
                    })
                )}

                {/* Right matches */}
                {rightRounds.map((matches, r) =>
                    matches.map((m, i) => {
                        const { colStart, rowStart } = gridPlacementHalf({ r, i, colBase: COLS, dir: -1 });
                        return (
                            <div key={`R-${m.id}`} style={styles.matchWrap(colStart, rowStart)}>
                                <div className="bracket-card" tabIndex={0}>
                                    <div className="bracket-name">{m.p1 ? m.p1.name : <span style={styles.empty}>TBD</span>}</div>
                                    <div className="bracket-name">{m.p2 ? m.p2.name : <span style={styles.empty}>TBD</span>}</div>
                                </div>
                            </div>
                        );
                    })
                )}

                {/* Center Final (from state.final) */}
                {(() => {
                    const { colStart, rowStart } = gridPlacementFinal();
                    const left = final.left?.name ?? 'Left Finalist';
                    const right = final.right?.name ?? 'Right Finalist';
                    const winner = final.winner?.name ?? 'Winner 🏆';
                    return (
                        <>

                            {/* Finalists preview (optional): replace with single winner card if you prefer */}
                            <div style={styles.matchWrap(colStart, rowStart)}>

                                <div className="bracket-card" tabIndex={0}>
                                    <div className="bracket-name" style={{ textAlign: 'center' }}>FINAL</div>

                                    <div className="bracket-name" style={{ textAlign: 'start' }}>{left}</div>
                                    <div className="bracket-name" style={{ textAlign: 'end' }}>{right}</div>
                                </div>
                            </div>
                            {/* Winner label just below (optional) */}

                        </>
                    );
                })()}
            </div>
        </div>
    );
});

export default Bracket64SplitInteractive;
