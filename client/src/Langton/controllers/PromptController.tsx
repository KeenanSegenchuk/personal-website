import * as React from "react";
import GridContext from "./GridContext";

export default class PromptController {
  prompt: string = "";
  private listeners: Set<() => void> = new Set();
  private ctxUnsub: () => void;

  constructor(private ctx: GridContext) {
    this.ctxUnsub = ctx.subscribeKey("antType", () => this.notify());
  }

  setPrompt = (text: string): void => {
    this.prompt = text;
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
    if (this.ctx.get("antType") !== "random") return null;
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "4px 0" }}>
        <label style={{ color: "#9dd8ec", fontSize: "0.85rem", letterSpacing: "0.06em" }}>
          Prompt:
        </label>
        <textarea
          value={this.prompt}
          onChange={(e) => this.setPrompt(e.target.value)}
          placeholder="Describe an ant..."
          rows={2}
          style={{
            background: "rgba(10, 55, 75, 0.85)",
            color: "#cff0ff",
            border: "1px solid rgba(80, 185, 215, 0.50)",
            borderRadius: "4px",
            padding: "4px 8px",
            fontSize: "0.85rem",
            resize: "vertical",
            width: "200px",
          }}
        />
      </div>
    );
  };
}
