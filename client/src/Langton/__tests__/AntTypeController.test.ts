/**
 * Tests for AntTypeController.tsx
 *
 * AntTypeController stores the selected ant type, notifies subscribers when
 * it changes, and renders a <select> that drives the selection.
 */

import AntTypeController from "../controllers/AntTypeController";
import type { AntType } from "../controllers/AntTypeController";

// ---------------------------------------------------------------------------
// Constructor
// ---------------------------------------------------------------------------

describe("AntTypeController — constructor", () => {
  it("defaults to 'ant' when no initialType is given", () => {
    const ctrl = new AntTypeController();
    expect(ctrl.antType).toBe("ant");
  });

  it("uses the provided initialType", () => {
    expect(new AntTypeController("random").antType).toBe("random");
    expect(new AntTypeController("plant").antType).toBe("plant");
  });
});

// ---------------------------------------------------------------------------
// setAntType
// ---------------------------------------------------------------------------

describe("AntTypeController — setAntType", () => {
  it("updates antType", () => {
    const ctrl = new AntTypeController();
    ctrl.setAntType("random");
    expect(ctrl.antType).toBe("random");
  });

  it("updates antType again on a second call", () => {
    const ctrl = new AntTypeController();
    ctrl.setAntType("random");
    ctrl.setAntType("plant");
    expect(ctrl.antType).toBe("plant");
  });

  it("notifies a subscribed listener", () => {
    const listener = jest.fn();
    const ctrl = new AntTypeController();
    ctrl.subscribe(listener);
    ctrl.setAntType("plant");
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("notifies all subscribers", () => {
    const a = jest.fn();
    const b = jest.fn();
    const ctrl = new AntTypeController();
    ctrl.subscribe(a);
    ctrl.subscribe(b);
    ctrl.setAntType("random");
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
  });

  it("notifies on every type change, including setting the same type", () => {
    const listener = jest.fn();
    const ctrl = new AntTypeController("ant");
    ctrl.subscribe(listener);
    ctrl.setAntType("ant"); // same value — still notifies
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// subscribe / unsubscribe
// ---------------------------------------------------------------------------

describe("AntTypeController — subscribe / unsubscribe", () => {
  it("subscribe returns a function that removes the listener", () => {
    const listener = jest.fn();
    const ctrl = new AntTypeController();
    const unsubscribe = ctrl.subscribe(listener);
    unsubscribe();
    ctrl.setAntType("random");
    expect(listener).not.toHaveBeenCalled();
  });

  it("unsubscribeAll removes all listeners at once", () => {
    const a = jest.fn();
    const b = jest.fn();
    const ctrl = new AntTypeController();
    ctrl.subscribe(a);
    ctrl.subscribe(b);
    ctrl.unsubscribeAll();
    ctrl.setAntType("random");
    expect(a).not.toHaveBeenCalled();
    expect(b).not.toHaveBeenCalled();
  });

  it("does not notify a listener that was never added", () => {
    const listener = jest.fn();
    const ctrl = new AntTypeController();
    ctrl.notify(); // manual notify with no subscribers
    expect(listener).not.toHaveBeenCalled();
  });

  it("adding the same listener twice only calls it once per notify", () => {
    const listener = jest.fn();
    const ctrl = new AntTypeController();
    ctrl.subscribe(listener);
    ctrl.subscribe(listener); // duplicate — Set ignores it
    ctrl.setAntType("random");
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// All valid AntType values are accepted
// ---------------------------------------------------------------------------

describe("AntTypeController — all AntType values", () => {
  const types: AntType[] = ["ant", "random", "plant"];

  types.forEach((type) => {
    it(`accepts type "${type}"`, () => {
      const ctrl = new AntTypeController();
      ctrl.setAntType(type);
      expect(ctrl.antType).toBe(type);
    });
  });
});

// ---------------------------------------------------------------------------
// Static labels map
// ---------------------------------------------------------------------------

describe("AntTypeController — static labels", () => {
  it("has a label for every AntType", () => {
    const types: AntType[] = ["ant", "random", "plant"];
    types.forEach(t => expect(AntTypeController.labels[t]).toBeTruthy());
  });

  it("labels ant as \"Langton's Ant\"", () => {
    expect(AntTypeController.labels.ant).toBe("Langton's Ant");
  });

  it('labels random as "Random Ant"', () => {
    expect(AntTypeController.labels.random).toBe("Random Ant");
  });

  it('labels plant as "Random Plant"', () => {
    expect(AntTypeController.labels.plant).toBe("Random Plant");
  });
});

// ---------------------------------------------------------------------------
// Static tooltips map
// ---------------------------------------------------------------------------

describe("AntTypeController — static tooltips", () => {
  it("has a non-empty tooltip for every AntType", () => {
    const types: AntType[] = ["ant", "random", "plant"];
    types.forEach(t => {
      expect(typeof AntTypeController.tooltips[t]).toBe("string");
      expect(AntTypeController.tooltips[t].length).toBeGreaterThan(0);
    });
  });

  it("tooltips and labels cover exactly the same keys", () => {
    const labelKeys = Object.keys(AntTypeController.labels).sort();
    const tooltipKeys = Object.keys(AntTypeController.tooltips).sort();
    expect(tooltipKeys).toEqual(labelKeys);
  });
});
