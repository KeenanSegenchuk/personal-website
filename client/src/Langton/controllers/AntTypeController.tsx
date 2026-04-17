import * as React from "react";
import GridContext from "./GridContext";

export type AntType = "ant" | "plant" | "random" | "custom";

export default class AntTypeController {
  antType: AntType;
  private listeners: Set<() => void> = new Set();

  static readonly labels: Record<AntType, string> = {
    ant:    "Langton's Ant",
    random: "Random Ant",
    plant:  "Random Plant",
    custom: "Custom Config",
  };

  static readonly tooltips: Record<AntType, string> = {
    ant:    "Classic Langton's Ant: turn left on black, right on white. Simple rules, surprisingly complex highways.",
    random: "AI-generated ruleset fetched from the server. Each color maps to a custom turn direction — expect the unexpected.",
    plant:  "A procedurally generated plant-like automaton. Sparse, branching, and oddly peaceful.",
    custom: "Paste your own ant config JSON directly. Full control over rules, start direction, and color count.",
  };

  constructor(initialType: AntType = "ant", private ctx?: GridContext) {
    this.antType = initialType;
  }

  setAntType = (type: AntType): void => {
    this.antType = type;
    this.ctx?.set("antType", type);
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
  }

  render = (): React.JSX.Element => {
    const tooltip = AntTypeController.tooltips[this.antType];
    return (
      <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", padding: "4px 0"}}>
        <div style={{display: "flex", alignItems: "center", gap: "8px"}}>
          <label style={{color: "#9dd8ec", fontSize: "0.85rem", letterSpacing: "0.06em"}}>
            Type:
          </label>
          <select
            value={this.antType}
            onChange={(e) => this.setAntType(e.target.value as AntType)}
            style={{
              background: "rgba(10, 55, 75, 0.85)",
              color: "#cff0ff",
              border: "1px solid rgba(80, 185, 215, 0.50)",
              borderRadius: "4px",
              padding: "2px 8px",
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            {(Object.keys(AntTypeController.labels) as AntType[]).map(type => (
              <option key={type} value={type}>{AntTypeController.labels[type]}</option>
            ))}
          </select>
        </div>
        <span style={{
          fontSize: "0.72rem",
          color: "rgba(160, 215, 235, 0.60)",
          fontStyle: "italic",
          maxWidth: "260px",
          textAlign: "center",
          lineHeight: 1.3,
        }}>
          {tooltip}
        </span>
      </div>
    );
  };
}
