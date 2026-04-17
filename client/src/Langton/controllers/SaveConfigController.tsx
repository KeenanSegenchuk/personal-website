import * as React from "react";
import axios from "axios";
import GridContext from "./GridContext";

export default class SaveConfigController {
  name: string = "";
  private saving: boolean = false;
  private savedMessage: boolean = false;
  private listeners: Set<() => void> = new Set();
  private ctxUnsubs: Array<() => void>;

  constructor(private ctx: GridContext) {
    this.ctxUnsubs = [
      ctx.subscribeKey("antType",    () => this.notify()),
      ctx.subscribeKey("lastConfig", () => this.notify()),
    ];
  }

  setName = (text: string): void => {
    this.name = text;
    this.notify();
  };

  save = async (): Promise<void> => {
    const config = this.ctx.get("lastConfig");
    if (!config || this.saving) return;
    this.saving = true;
    this.notify();
    try {
      await axios.post("http://localhost:5000/api/langton/save_config", {
        name: this.name.trim() || "unnamed",
        config,
      });
      this.name = "";
      this.savedMessage = true;
      this.notify();
      setTimeout(() => { this.savedMessage = false; this.notify(); }, 2000);
    } catch (err) {
      console.error("Failed to save config:", err);
    } finally {
      this.saving = false;
      this.notify();
    }
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
    this.ctxUnsubs.forEach(u => u());
  }

  render = (): React.JSX.Element | null => {
    if (this.ctx.get("antType") !== "random" || !this.ctx.get("lastConfig")) return null;
    return (
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "8px", padding: "6px 0 2px" }}>
        <input
          type="text"
          value={this.name}
          onChange={(e) => this.setName(e.target.value)}
          placeholder="Name this ant..."
          style={{
            background: "rgba(10, 55, 75, 0.85)",
            color: "#cff0ff",
            border: "1px solid rgba(80, 185, 215, 0.50)",
            borderRadius: "4px",
            padding: "4px 8px",
            fontSize: "0.85rem",
            width: "160px",
          }}
        />
        <button
          className="langton-btn"
          onClick={this.save}
          disabled={this.saving}
        >
          {this.saving ? "Saving..." : this.savedMessage ? "Saved!" : "Save Config"}
        </button>
      </div>
    );
  };
}
