/**
 * Tests for Stepper.ts (StepController)
 *
 * StepController manages the animation loop that drives simulation stepping.
 * It uses requestAnimationFrame (rAF) and performance.now(), both provided
 * by the jsdom test environment.
 *
 * Key behaviours under test:
 *   - Time accumulation: steps are called at `stepSpeed` Hz
 *   - Toggle: onToggle starts / stops the rAF loop
 *   - Observer pattern: subscribe/notify listeners
 *   - setStepSpeed: updates speed and notifies
 */

import StepController from "../Stepper";

// ---------------------------------------------------------------------------
// rAF / performance mocks
// ---------------------------------------------------------------------------

let rafCallbacks: Map<number, FrameRequestCallback> = new Map();
let rafIdCounter = 0;

beforeEach(() => {
  rafCallbacks = new Map();
  rafIdCounter = 0;

  jest.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
    const id = ++rafIdCounter;
    rafCallbacks.set(id, cb);
    return id;
  });

  jest.spyOn(window, "cancelAnimationFrame").mockImplementation((id) => {
    rafCallbacks.delete(id);
  });

  jest.spyOn(performance, "now").mockReturnValue(0);
});

afterEach(() => {
  jest.restoreAllMocks();
});

/** Advance the most recently queued rAF callback with the given timestamp. */
function tick(timestamp: number): void {
  const lastId = rafIdCounter;
  const cb = rafCallbacks.get(lastId);
  if (cb) {
    rafCallbacks.delete(lastId);
    cb(timestamp);
  }
}

// ---------------------------------------------------------------------------
// Constructor
// ---------------------------------------------------------------------------

describe("StepController — constructor", () => {
  it("sets stepSpeed to the provided default", () => {
    const ctrl = new StepController(() => {}, 10);
    expect(ctrl.stepSpeed).toBe(10);
  });

  it("starts with toggle=false (paused)", () => {
    const ctrl = new StepController(() => {}, 5);
    expect(ctrl.toggle).toBe(false);
  });

  it("starts with stepNum=0", () => {
    const ctrl = new StepController(() => {}, 5);
    expect(ctrl.stepNum).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// onToggle — start / stop
// ---------------------------------------------------------------------------

describe("StepController — onToggle", () => {
  it("sets toggle to true on first call", () => {
    const ctrl = new StepController(() => {}, 5);
    ctrl.onToggle();
    expect(ctrl.toggle).toBe(true);
  });

  it("sets toggle to false on second call", () => {
    const ctrl = new StepController(() => {}, 5);
    ctrl.onToggle();
    ctrl.onToggle();
    expect(ctrl.toggle).toBe(false);
  });

  it("queues a rAF when starting", () => {
    const ctrl = new StepController(() => {}, 5);
    ctrl.onToggle();
    expect(window.requestAnimationFrame).toHaveBeenCalled();
  });

  it("does not queue a rAF when stopping", () => {
    const ctrl = new StepController(() => {}, 5);
    ctrl.onToggle();       // start → queues rAF
    const callsBefore = (window.requestAnimationFrame as jest.Mock).mock.calls.length;
    ctrl.onToggle();       // stop
    const callsAfter  = (window.requestAnimationFrame as jest.Mock).mock.calls.length;
    expect(callsAfter).toBe(callsBefore); // no new rAF queued
  });

  it("notifies listeners on toggle", () => {
    const listener = jest.fn();
    const ctrl = new StepController(() => {}, 5);
    ctrl.subscribe(listener);
    ctrl.onToggle();
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// loop — step counting
// ---------------------------------------------------------------------------

describe("StepController — loop: step counting", () => {
  it("does not call step when toggle is false", () => {
    const step = jest.fn();
    const ctrl = new StepController(step, 5);
    // Manually call loop without toggling on
    ctrl.loop(1000);
    expect(step).not.toHaveBeenCalled();
  });

  it("calls step once after one full interval elapses", () => {
    const step = jest.fn();
    const ctrl = new StepController(step, 10); // 10 Hz → interval = 0.1 s
    (performance.now as jest.Mock).mockReturnValue(0);
    ctrl.onToggle(); // sets lastTime = 0, queues rAF
    tick(100);       // 100 ms = 0.1 s elapsed → exactly one step
    expect(step).toHaveBeenCalledTimes(1);
  });

  it("calls step multiple times if multiple intervals have elapsed", () => {
    const step = jest.fn();
    const ctrl = new StepController(step, 10); // 10 Hz → interval = 0.1 s
    (performance.now as jest.Mock).mockReturnValue(0);
    ctrl.onToggle();
    tick(350); // 350 ms → 3 full 100 ms intervals
    expect(step).toHaveBeenCalledTimes(3);
  });

  it("increments stepNum once per step call", () => {
    const ctrl = new StepController(() => {}, 10);
    (performance.now as jest.Mock).mockReturnValue(0);
    ctrl.onToggle();
    tick(200); // 200 ms → 2 steps
    expect(ctrl.stepNum).toBe(2);
  });

  it("re-queues rAF after each tick while toggle is true", () => {
    const ctrl = new StepController(() => {}, 5);
    (performance.now as jest.Mock).mockReturnValue(0);
    ctrl.onToggle();
    const callsBefore = (window.requestAnimationFrame as jest.Mock).mock.calls.length;
    tick(200);
    const callsAfter = (window.requestAnimationFrame as jest.Mock).mock.calls.length;
    expect(callsAfter).toBeGreaterThan(callsBefore);
  });

  it("does not re-queue rAF after tick when toggle is false", () => {
    const ctrl = new StepController(() => {}, 5);
    (performance.now as jest.Mock).mockReturnValue(0);
    ctrl.onToggle();       // start
    ctrl.onToggle();       // stop immediately
    const callsBefore = (window.requestAnimationFrame as jest.Mock).mock.calls.length;
    tick(200);             // tick the already-queued rAF
    const callsAfter = (window.requestAnimationFrame as jest.Mock).mock.calls.length;
    expect(callsAfter).toBe(callsBefore); // no new rAF
  });

  it("calls renderCallback after stepping", () => {
    const renderCb = jest.fn();
    const ctrl = new StepController(() => {}, 10);
    ctrl.renderCallback = renderCb;
    (performance.now as jest.Mock).mockReturnValue(0);
    ctrl.onToggle();
    tick(100);
    expect(renderCb).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// setStepSpeed
// ---------------------------------------------------------------------------

describe("StepController — setStepSpeed", () => {
  it("updates stepSpeed", () => {
    const ctrl = new StepController(() => {}, 5);
    ctrl.setStepSpeed(20);
    expect(ctrl.stepSpeed).toBe(20);
  });

  it("notifies listeners", () => {
    const listener = jest.fn();
    const ctrl = new StepController(() => {}, 5);
    ctrl.subscribe(listener);
    ctrl.setStepSpeed(20);
    expect(listener).toHaveBeenCalled();
  });

  it("new speed is reflected in step timing", () => {
    const step = jest.fn();
    const ctrl = new StepController(step, 5); // 5 Hz → 200 ms interval
    ctrl.setStepSpeed(10);                    // 10 Hz → 100 ms interval
    (performance.now as jest.Mock).mockReturnValue(0);
    ctrl.onToggle();
    tick(100); // 100 ms → 1 step at 10 Hz (would be 0 at 5 Hz)
    expect(step).toHaveBeenCalledTimes(1);
  });

  // STUB: What should happen when stepSpeed is set to 0?
  // stepInterval = 1/0 = Infinity → the accumulator never reaches the interval
  // and step() is never called. Is this the intended "pause via speed" behaviour,
  // or should setStepSpeed(0) be treated as invalid / clamped to a minimum?
  // it("handles stepSpeed=0 gracefully", () => {
  //   const step = jest.fn();
  //   const ctrl = new StepController(step, 5);
  //   ctrl.setStepSpeed(0);
  //   ctrl.onToggle();
  //   tick(10000); // lots of time — step should never be called
  //   expect(step).not.toHaveBeenCalled(); // currently passes, but is this intended?
  // });

  // STUB: What should happen with negative stepSpeed?
  // stepInterval = 1/(-n) is negative → accumulator always exceeds it on the
  // first tick, causing an infinite loop inside the while(...) in loop().
  // Should negative values be rejected / clamped to 0?
  // it("rejects negative stepSpeed", () => {
  //   const ctrl = new StepController(() => {}, 5);
  //   expect(() => ctrl.setStepSpeed(-1)).toThrow();
  //   // OR: expect(ctrl.stepSpeed).toBe(5); // unchanged
  // });
});

// ---------------------------------------------------------------------------
// subscribe / notify
// ---------------------------------------------------------------------------

describe("StepController — subscribe / notify", () => {
  it("notifies all subscribed listeners", () => {
    const a = jest.fn();
    const b = jest.fn();
    const ctrl = new StepController(() => {}, 5);
    ctrl.subscribe(a);
    ctrl.subscribe(b);
    ctrl.notify();
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
  });

  it("does not notify before subscription", () => {
    const listener = jest.fn();
    const ctrl = new StepController(() => {}, 5);
    ctrl.notify(); // before subscribe
    ctrl.subscribe(listener);
    expect(listener).not.toHaveBeenCalled();
  });
});
