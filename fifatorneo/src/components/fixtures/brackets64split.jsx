import { useMemo } from "react";
import { makeRounds64 } from "../../utils/makeRounds64";
import "./styles/bracket.css";
/** ────────────────────────────────────────────────────────────────────────────
 * Mirrored 64-player bracket: Left(32) + Right(32) → Final at center
 *
 * Columns: 5 (left) + 1 (final) + 5 (right) = 11
 * Rows: scaled with ROW_STEP to avoid overlap at leaves.
 * Connectors are drawn with an absolute SVG overlay.
 * ──────────────────────────────────────────────────────────────────────────── */

// ── Layout constants ──────────────────────────────────────────────────────────
const LEFT_COLS = 5; // 32→16→8→4→2 on left side
const RIGHT_COLS = 5; // 32→16→8→4→2 on right side
const FINAL_COLS = 1; // center Final
const COLS = LEFT_COLS + FINAL_COLS + RIGHT_COLS; // 11

const BASE_ROWS_32 = 64; // logical triangle rows for a 32-player half
const ROW_STEP = 2; // vertical spacing multiplier (2 = tight, 3 = one empty row)
const TOP_ROWS = 4; // logical header rows
const HEADER_ROWS = TOP_ROWS * ROW_STEP;

const COL_WIDTH = 240; // px per column
const ROW_HEIGHT = 18; // px per row
const MATCH_ROW_SPAN = 2; // grid rows spanned by each match visually
const H_GAP = 16; // px horizontal gap between columns

const roundNamesLeft = [
  "Round of 32",
  "Round of 16",
  "Quarterfinals",
  "Semifinal",
  "Finalist",
];
const roundNamesRight = [
  "Round of 32",
  "Round of 16",
  "Quarterfinals",
  "Semifinal",
  "Finalist",
];

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  container: {
    width: "100%",
    overflowX: "auto",
    padding: "16px",
    boxSizing: "border-box",
  },
  grid: (rows) => ({
    position: "relative",
    display: "grid",
    gridTemplateColumns: `repeat(${COLS}, ${COL_WIDTH}px)`,
    gridTemplateRows: `repeat(${rows + HEADER_ROWS}, ${ROW_HEIGHT}px)`,
    gap: `0px ${H_GAP}px`,
    minWidth: `${COLS * (COL_WIDTH + H_GAP)}px`,
  }),
  roundHeader: (col, spanRows) => ({
    gridColumn: `${col} / span 1`,
    gridRow: `1 / span ${spanRows}`,
    fontWeight: 700,
    padding: "0 4px 8px 4px",
    position: "sticky",
    top: 0,
    background:
      "linear-gradient(180deg, rgba(17,24,39,0.85), rgba(17,24,39,0.0))",
    color: "#E5E7EB",
    zIndex: 2,
  }),
  matchWrap: (colStart, rowStart) => ({
    gridColumn: `${colStart} / span 1`,
    gridRow: `${rowStart} / span ${MATCH_ROW_SPAN}`,
  }),
  matchCard: {
    background: "#111827",
    color: "#E5E7EB",
    border: "1px solid #374151",
    borderRadius: "10px",
    padding: "8px 10px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
    fontSize: 13,
    lineHeight: 1.35,
  },
  name: { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  empty: { color: "#9CA3AF", fontStyle: "italic" },
  connectors: (rows) => ({
    position: "absolute",
    left: 0,
    top: 0,
    width: `${COLS * (COL_WIDTH + H_GAP)}px`,
    height: `${(rows + HEADER_ROWS) * ROW_HEIGHT}px`,
    pointerEvents: "none",
    overflow: "visible",
    zIndex: 1,
  }),
};

// ── Small helper to create rounds for a power-of-two player list ──────────────
function makeRoundsFromNames(names) {
  // names.length must be power of two (here 32 per side)
  const n = names.length;
  const rounds = [];
  let roundSize = n;
  let roundPlayers = names.map((nm, idx) => ({ id: `p-${idx}`, name: nm }));

  let matchId = 0;
  while (roundSize >= 2) {
    const matches = [];
    for (let i = 0; i < roundSize; i += 2) {
      matches.push({
        id: `m-${matchId++}`,
        p1: roundPlayers[i] || null,
        p2: roundPlayers[i + 1] || null,
      });
    }
    rounds.push(matches);
    // winners unknown now; structure only
    roundSize = roundSize / 2;
    roundPlayers = Array.from({ length: roundSize }, () => null);
  }
  return rounds; // e.g., 32,16,8,4,2
}

// ── Grid placement for a half (32→2) ─────────────────────────────────────────
/**
 * colBase: starting column for this side
 * r: round index (0..4)
 * i: match index in that round
 * dir: +1 for left side (columns increase toward center), -1 for right side (mirror)
 */
function gridPlacementHalf({ r, i, colBase, dir }) {
  const stride = 2 ** (r + 1); // 2,4,8,16,32
  const offset = 2 ** r; // 1,2,4,8,16
  const logicalRow = 1 + i * stride + offset; // same triangle math
  const rowStart = HEADER_ROWS + logicalRow * ROW_STEP;

  // Left side: r=0 at colBase, r increases toward center
  // Right side: r=0 at colBase, but columns move left (dir = -1)
  const colStart = colBase + dir * r;
  return { colStart, rowStart };
}

// Center final placement (align with half-finalists row)
function gridPlacementFinal() {
  // In each half, the finalist (r=4,i=0) sits at logicalRow = 1 + 0*32 + 16 = 17
  const logicalRow = 17;
  const rowStart = HEADER_ROWS + logicalRow * ROW_STEP;
  // final column is exactly the center = LEFT_COLS + 1 = 6
  const colStart = LEFT_COLS + 1;
  return { colStart, rowStart };
}

// Pixel helpers for connectors
function cellCenterPx({ colStart, rowStart }) {
  const xLeft = (colStart - 1) * (COL_WIDTH + H_GAP);
  const xCenter = xLeft + COL_WIDTH / 2;
  const yTop = (rowStart - 1) * ROW_HEIGHT;
  const yCenter = yTop + (MATCH_ROW_SPAN * ROW_HEIGHT) / 2;
  return { xLeft, xRight: xLeft + COL_WIDTH, xCenter, yCenter };
}

// ── Connectors overlay ───────────────────────────────────────────────────────
function Connectors({ leftRounds, rightRounds, rowsTotal }) {
  const paths = [];

  // Left side connectors: flow to the right (toward center)
  for (let r = 0; r < leftRounds.length - 1; r++) {
    const curr = leftRounds[r];
    for (let i = 0; i < curr.length; i++) {
      const srcPos = gridPlacementHalf({ r, i, colBase: 1, dir: +1 });
      const dstPos = gridPlacementHalf({
        r: r + 1,
        i: Math.floor(i / 2),
        colBase: 1,
        dir: +1,
      });

      const src = cellCenterPx(srcPos);
      const dst = cellCenterPx(dstPos);
      const x1 = src.xRight;
      const y1 = src.yCenter;
      const x2 = dst.xLeft;
      const y2 = dst.yCenter;
      const xMid = x1 + Math.max(8, (x2 - x1) * 0.35);
      paths.push(`M ${x1} ${y1} H ${xMid} V ${y2} H ${x2}`);
    }
  }

  // Right side connectors: start at far right and flow left toward center
  for (let r = 0; r < rightRounds.length - 1; r++) {
    const curr = rightRounds[r];
    for (let i = 0; i < curr.length; i++) {
      const srcPos = gridPlacementHalf({
        r,
        i,
        colBase: COLS,
        dir: -1, // <-- start at far right column 11
      });
      const dstPos = gridPlacementHalf({
        r: r + 1,
        i: Math.floor(i / 2),
        colBase: COLS,
        dir: -1,
      });

      const src = cellCenterPx(srcPos);
      const dst = cellCenterPx(dstPos);
      const x1 = src.xLeft;
      const y1 = src.yCenter;
      const x2 = dst.xRight;
      const y2 = dst.yCenter;
      const xMid = x1 - Math.max(8, (x1 - x2) * 0.35);
      paths.push(`M ${x1} ${y1} H ${xMid} V ${y2} H ${x2}`);
    }
  }

  // Connect left finalist to center final
  const leftFinalPos = gridPlacementHalf({
    r: LEFT_COLS - 1,
    i: 0,
    colBase: 1,
    dir: +1,
  }); // col 5
  const centerFinalPos = gridPlacementFinal();
  {
    const src = cellCenterPx(leftFinalPos);
    const dst = cellCenterPx(centerFinalPos);
    const x1 = src.xRight,
      y1 = src.yCenter;
    const x2 = dst.xLeft,
      y2 = dst.yCenter;
    const xMid = x1 + Math.max(8, (x2 - x1) * 0.35);
    paths.push(`M ${x1} ${y1} H ${xMid} V ${y2} H ${x2}`);
  }

  // Connect right finalist to center final
  const rightFinalPos = gridPlacementHalf({
    r: RIGHT_COLS - 1,
    i: 0,
    colBase: COLS,
    dir: -1, // finalist at col 7
  });
  {
    const src = cellCenterPx(rightFinalPos);
    const dst = cellCenterPx(centerFinalPos);
    const x1 = src.xLeft,
      y1 = src.yCenter;
    const x2 = dst.xRight,
      y2 = dst.yCenter;
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

// ── Component ────────────────────────────────────────────────────────────────
export default function Bracket64Split({ players, showConnectors = true }) {
  const names = useMemo(
    () =>
      Array.isArray(players) && players.length === 64
        ? players
        : Array.from({ length: 64 }, (_, i) => `Player ${i + 1}`),
    [players]
  );

  const [leftRounds, rightRounds] = useMemo(() => {
    const leftNames = names.slice(0, 32);
    const rightNames = names.slice(32, 64);
    const L = makeRoundsFromNames(leftNames);
    const R = makeRoundsFromNames(rightNames);
    return [L, R];
  }, [names]);

  // rows needed for a 32-player triangle (per side)
  const rowsPerHalf = BASE_ROWS_32 * ROW_STEP;

  return (
    <div style={styles.container}>
      <div style={styles.grid(rowsPerHalf)}>
        {/* Left headers (columns 1..5) */}
        {roundNamesLeft.map((title, r) => (
          <div key={`lh-${r}`} style={styles.roundHeader(1 + r, HEADER_ROWS)}>
            {title}
          </div>
        ))}

        {/* Center header (Final) */}
        <div style={styles.roundHeader(LEFT_COLS + 1, HEADER_ROWS)}>Final</div>

        {/* Right headers (columns 7..11), mirrored titles */}
        {roundNamesRight.map((title, r) => (
          <div
            key={`rh-${r}`}
            style={styles.roundHeader(COLS - r, HEADER_ROWS)} // 11,10,9,8,7
          >
            {title}
          </div>
        ))}

        {/* Optional connectors */}
        {showConnectors && (
          <Connectors
            leftRounds={leftRounds}
            rightRounds={rightRounds}
            rowsTotal={rowsPerHalf}
          />
        )}

        {/* Left matches: columns 1..5 (outer→center) */}
        {leftRounds.map((matches, r) =>
          matches.map((m, i) => {
            const { colStart, rowStart } = gridPlacementHalf({
              r,
              i,
              colBase: 1,
              dir: +1,
            });
            return (
              <div
                key={`L-${m.id}`}
                style={styles.matchWrap(colStart, rowStart)}
              >
                <div className="bracket-card">
                  <div className="bracket-name">
                    {m.p1 ? m.p1.name : <span style={styles.empty}>TBD</span>}
                  </div>
                  <div className="bracket-name">
                    {m.p2 ? m.p2.name : <span style={styles.empty}>TBD</span>}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Right matches: columns 11..7 (outer→center) */}
        {rightRounds.map((matches, r) =>
          matches.map((m, i) => {
            const { colStart, rowStart } = gridPlacementHalf({
              r,
              i,
              colBase: COLS,
              dir: -1, // start at far right, move left to center
            });
            return (
              <div
                key={`R-${m.id}`}
                style={styles.matchWrap(colStart, rowStart)}
              >
                <div className="bracket-card">
                  <div className="bracket-name">
                    {m.p1 ? m.p1.name : <span style={styles.empty}>TBD</span>}
                  </div>
                  <div className="bracket-name">
                    {m.p2 ? m.p2.name : <span style={styles.empty}>TBD</span>}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Center Final match (aligned with finalists’ row) */}
        {(() => {
          const { colStart, rowStart } = gridPlacementFinal();
          return (
            <div style={styles.matchWrap(colStart, rowStart)}>
              <div className="bracket-card">
                <div className="bracket-name">Winner 🏆</div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
