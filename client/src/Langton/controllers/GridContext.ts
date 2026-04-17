import { AntType } from "./AntTypeController";

export type GridState = {
  antType: AntType;
  nColors: number;
  lastConfig: string | null;
};

type KeyListeners = { [K in keyof GridState]?: Set<() => void> };

export default class GridContext {
  private state: GridState;
  private keyListeners: KeyListeners = {};
  private globalListeners: Set<() => void> = new Set();

  constructor(initial: GridState) {
    this.state = { ...initial };
  }

  get<K extends keyof GridState>(key: K): GridState[K] {
    return this.state[key];
  }

  set<K extends keyof GridState>(key: K, value: GridState[K]): void {
    this.state[key] = value;
    this.keyListeners[key]?.forEach(fn => fn());
    this.globalListeners.forEach(fn => fn());
  }

  subscribeKey<K extends keyof GridState>(key: K, listener: () => void): () => void {
    (this.keyListeners[key] ??= new Set()).add(listener);
    return () => { this.keyListeners[key]?.delete(listener); };
  }

  subscribe(listener: () => void): () => void {
    this.globalListeners.add(listener);
    return () => { this.globalListeners.delete(listener); };
  }

  unsubscribeAll(): void {
    this.keyListeners = {};
    this.globalListeners.clear();
  }
}
