import * as React from "react";
import GridContext from "./GridContext";
import { AntType } from "./AntTypeController";

const VISIBLE_TYPES: AntType[] = ["random", "plant"];

export default class NColorsController {
  private listeners: Set<() => void> = new Set();
  private ctxUnsub: () => void;

  constructor(private ctx: GridContext) {
    this.ctxUnsub = ctx.subscribeKey("antType", () => this.notify());
  }

  setNColors = (n: number): void => {
    this.ctx.set("nColors", Math.max(2, Math.min(8, n)));
    this.notify();
  };

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  notify(): void {
    for (const fn of this.listeners) fn();
  }

  unsubscribeAll(): void {
    this.listeners.clear();
    this.ctxUnsub();
  }

  render = (): React.JSX.Element | null => {
    if (!VISIBLE_TYPES.includes(this.ctx.get("antType"))) return null;
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "4px 0" }}>
        <label style={{ color: "#9dd8ec", fontSize: "0.85rem", letterSpacing: "0.06em" }}>
          Colors:
        </label>
        <input
          type="number"
          min={2}
          max={8}
          value={this.ctx.get("nColors")}
          onChange={(e) => this.setNColors(Number(e.target.value))}
          style={{
            background: "rgba(10, 55, 75, 0.85)",
            color: "#cff0ff",
            border: "1px solid rgba(80, 185, 215, 0.50)",
            borderRadius: "4px",
            padding: "2px 8px",
            fontSize: "0.85rem",
            width: "60px",
            textAlign: "center",
          }}
        />
      </div>
    );
  };
}
