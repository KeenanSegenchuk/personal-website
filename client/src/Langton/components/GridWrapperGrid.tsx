import React, { useRef, useState } from 'react';
import GridWrapper from './GridWrapper';

type GridWrapperGridProps = {
  width: number;
  height: number;
  gridDimensions: string;
};

function GridWrapperGrid({ width, height, gridDimensions }: GridWrapperGridProps) {
  const nextId = useRef(1);

  // 2D array of stable cell IDs (row-major). Start 1x1 with ID 0.
  const [grid, setGrid] = useState<number[][]>([[0]]);

  const rows = grid.length;
  const cols = grid[0].length;

  // Top/left buttons prepend; bottom/right buttons append.
  const addRowTop    = () => setGrid(g => [Array.from({ length: g[0].length }, () => nextId.current++), ...g]);
  const addRowBottom = () => setGrid(g => [...g, Array.from({ length: g[0].length }, () => nextId.current++)]);
  const removeRowTop    = () => setGrid(g => g.length > 1 ? g.slice(1)     : g);
  const removeRowBottom = () => setGrid(g => g.length > 1 ? g.slice(0, -1) : g);

  const addColLeft   = () => setGrid(g => g.map(row => [nextId.current++, ...row]));
  const addColRight  = () => setGrid(g => g.map(row => [...row, nextId.current++]));
  const removeColLeft  = () => setGrid(g => g[0].length > 1 ? g.map(row => row.slice(1))     : g);
  const removeColRight = () => setGrid(g => g[0].length > 1 ? g.map(row => row.slice(0, -1)) : g);

  const btn = (label: string, onClick: () => void, disabled: boolean) => (
    <button
      className="langton-btn"
      style={{ margin: "4px", padding: "0.4rem 0.9rem", fontSize: "0.82rem" }}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
      {/* Top row: add/remove rows — centered */}
      <div style={{ display: "flex", gap: "2px" }}>
        {btn("▼ − Row", removeRowTop,    rows <= 1)}
        {btn("+ Row ▲", addRowTop,       false)}
      </div>

      {/* Middle: col buttons flanking the grid */}
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", width: "max-content", margin: "0 auto" }}>
        <div style={{ display: "flex", flexDirection: "column", flexShrink: 0 }}>
          {btn("▶ − Col", removeColLeft,  cols <= 1)}
          {btn("◀ + Col", addColLeft,     false)}
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, max-content)`,
        }}>
          {grid.flat().map(id => (
            <GridWrapper
              key={id}
              title="Langton's Ant"
              width={width}
              height={height}
              gridDimensions={gridDimensions}
            />
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", flexShrink: 0 }}>
          {btn("+ Col ▶", addColRight,    false)}
          {btn("− Col ◀", removeColRight, cols <= 1)}
        </div>
      </div>

      {/* Bottom row: add/remove rows — centered */}
      <div style={{ display: "flex", gap: "2px" }}>
        {btn("▼ + Row", addRowBottom,    false)}
        {btn("▲ − Row", removeRowBottom, rows <= 1)}
      </div>
    </div>
  );
}

export default GridWrapperGrid;
