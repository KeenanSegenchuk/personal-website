import * as React from "react";
import GridContext from "./GridContext";

const PLACEHOLDER = `{
  "rules": {
    "0": { "turn": "right", "flipTo": 1 },
    "1": { "turn": "left",  "flipTo": 0 }
  },
  "startDirection": "N",
  "startColor": 0
}`;

export default class AntConfigController {
  config: string = "";
  private listeners: Set<() => void> = new Set();
  private ctxUnsub: () => void;

  constructor(private ctx: GridContext) {
    this.ctxUnsub = ctx.subscribeKey("antType", () => this.notify());
  }

  setConfig = (text: string): void => {
    this.config = text;
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
    if (this.ctx.get("antType") !== "custom") return null;
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "4px 0" }}>
        <label style={{ color: "#9dd8ec", fontSize: "0.85rem", letterSpacing: "0.06em" }}>
          Config JSON:
        </label>
        <textarea
          value={this.config}
          onChange={(e) => this.setConfig(e.target.value)}
          placeholder={PLACEHOLDER}
          rows={6}
          spellCheck={false}
          style={{
            background: "rgba(10, 55, 75, 0.85)",
            color: "#cff0ff",
            border: "1px solid rgba(80, 185, 215, 0.50)",
            borderRadius: "4px",
            padding: "6px 8px",
            fontSize: "0.78rem",
            fontFamily: "monospace",
            resize: "vertical",
            width: "260px",
          }}
        />
      </div>
    );
  };
}
