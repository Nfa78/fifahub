import { useMemo } from "react";
import { makeRounds64 } from "../../utils/makeRounds64";

/**
 * Triangle bracket layout (64 → 1)
 * --------------------------------
 * Grid columns = rounds (6). Grid rows = logical triangle rows * ROW_STEP + header padding.
 * We scale vertical spacing with ROW_STEP so leaf matches don't touch/overlap.
 */

// ── Layout constants ──────────────────────────────────────────────────────────
const COLS = 6; // 64→32→16→8→4→2→1
const BASE_ROWS = 128; // logical triangle rows (power of two layout)
const ROW_STEP = 2; // vertical spacing multiplier (≥2 recommended). 3 = 1 empty row between leaf cards
const ROWS = BASE_ROWS * ROW_STEP;

const TOP_ROWS = 4; // logical rows reserved for sticky headers
const HEADER_ROWS = TOP_ROWS * ROW_STEP;

const COL_WIDTH = 240; // px per column
const ROW_HEIGHT = 18; // px per row
const MATCH_ROW_SPAN = 2; // rows spanned by each match card (visual height)
const H_GAP = 16; // px horizontal gap between columns

const roundNames = [
  "Round of 64",
  "Round of 32",
  "Round of 16",
  "Quarterfinals",
  "Semifinals",
  "Final",
];

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  container: {
    width: "100%",
    overflowX: "auto",
    padding: "16px",
    boxSizing: "border-box",
  },
  grid: {
    position: "relative",
    display: "grid",
    gridTemplateColumns: `repeat(${COLS}, ${COL_WIDTH}px)`,
    gridTemplateRows: `repeat(${ROWS + HEADER_ROWS}, ${ROW_HEIGHT}px)`,
    gap: `0px ${H_GAP}px`, // no vertical gap; horizontal only
    minWidth: `${COLS * (COL_WIDTH + H_GAP)}px`,
  },
  roundHeader: (col) => ({
    gridColumn: `${col} / span 1`,
    gridRow: `1 / span ${HEADER_ROWS}`,
    fontWeight: 700,
    padding: "0 4px 8px 4px",
    position: "sticky",
    top: 0,
    background:
      "linear-gradient(180deg, rgba(17,24,39,0.85), rgba(17,24,39,0.0))",
    color: "#E5E7EB",
    zIndex: 2,
  }),
  matchCardWrap: (colStart, rowStart) => ({
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

  // SVG overlay for connectors
  connectors: {
    position: "absolute",
    left: 0,
    top: 0,
    width: `${COLS * (COL_WIDTH + H_GAP)}px`,
    height: `${(ROWS + HEADER_ROWS) * ROW_HEIGHT}px`,
    pointerEvents: "none",
    overflow: "visible",
    zIndex: 1, // below sticky headers but above background
  },
};

/** Compute grid placement (column, row) for match (round r, index i). */
function gridPlacement(r, i) {
  const stride = 2 ** (r + 1); // distance between matches in this round (logical)
  const offset = 2 ** r; // vertical offset to center above previous pair (logical)
  const logicalRow = 1 + i * stride + offset;
  const rowStart = HEADER_ROWS + logicalRow * ROW_STEP; // push below headers & scale spacing
  const colStart = r + 1; // columns are 1-indexed in CSS grid
  return { colStart, rowStart };
}

/** Convert a grid cell to pixel centers for the connector lines. */
function cellCenterPx({ colStart, rowStart }) {
  const xLeft = (colStart - 1) * (COL_WIDTH + H_GAP);
  const xCenter = xLeft + COL_WIDTH / 2;
  const yTop = (rowStart - 1) * ROW_HEIGHT;
  const yCenter = yTop + (MATCH_ROW_SPAN * ROW_HEIGHT) / 2;
  return { xLeft, xRight: xLeft + COL_WIDTH, xCenter, yCenter };
}

/** Draw connectors between rounds using an SVG overlay. */
function Connectors({ rounds }) {
  const paths = [];

  for (let r = 0; r < rounds.length - 1; r++) {
    const curr = rounds[r];
    for (let i = 0; i < curr.length; i++) {
      // Match i in round r feeds into match floor(i/2) in round r+1
      const srcPos = gridPlacement(r, i);
      const dstPos = gridPlacement(r + 1, Math.floor(i / 2));

      const src = cellCenterPx(srcPos);
      const dst = cellCenterPx(dstPos);

      // L-shaped connector from right edge of src to left edge of dst column
      const x1 = src.xRight;
      const y1 = src.yCenter;
      const x2 = dst.xLeft;
      const y2 = dst.yCenter;
      const xMid = x1 + Math.max(8, (x2 - x1) * 0.35); // bend point; tweak feel

      const d = `M ${x1} ${y1} H ${xMid} V ${y2} H ${x2}`;
      paths.push(d);
    }
  }

  return (
    <svg style={styles.connectors}>
      {paths.map((d, idx) => (
        <path key={idx} d={d} fill="none" stroke="#374151" strokeWidth="2" />
      ))}
    </svg>
  );
}

export default function Bracket64({ players, showConnectors = true }) {
  const names = useMemo(
    () =>
      Array.isArray(players) && players.length === 64
        ? players
        : Array.from({ length: 64 }, (_, i) => `Player ${i + 1}`),
    [players]
  );

  const rounds = useMemo(() => {
    const r = makeRounds64(names);
    // If you later set winners in r[0], you can call propagateWinners(r) to fill future rounds.
    // return propagateWinners(r);
    return r;
  }, [names]);

  return (
    <div style={styles.container}>
      <div style={styles.grid}>
        {/* Sticky round headers */}
        {roundNames.map((title, r) => (
          <div key={`hdr-${r}`} style={styles.roundHeader(r + 1)}>
            {title}
          </div>
        ))}

        {/* Optional connectors */}
        {showConnectors && <Connectors rounds={rounds} />}

        {/* Matches */}
        {rounds.map((matches, r) =>
          matches.map((m, i) => {
            const { colStart, rowStart } = gridPlacement(r, i);
            return (
              <div key={m.id} style={styles.matchCardWrap(colStart, rowStart)}>
                <div style={styles.matchCard}>
                  <div style={styles.name}>
                    {m.p1 ? m.p1.name : <span style={styles.empty}>TBD</span>}
                  </div>
                  <div style={styles.name}>
                    {m.p2 ? m.p2.name : <span style={styles.empty}>TBD</span>}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
