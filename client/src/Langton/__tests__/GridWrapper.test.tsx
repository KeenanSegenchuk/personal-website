/**
 * Tests for Langton/components/GridWrapper.tsx
 *
 * Focuses on the AntTypeController integration:
 *   - Default type ("ant") is passed to LangstonGrid on first render
 *   - Selecting a different type via the <select> and clicking "Generate New Ant"
 *     creates a new LangstonGrid with that type
 *   - Cooldown prevents generating a new ant before the timer expires
 *   - PromptController textarea is hidden for "ant" type, visible for others
 *
 * LangstonGrid and StepController are manually mocked so Jest never loads
 * the real files (which would pull in axios / ESM modules that break in jsdom).
 */

import React from "react";
import { render, screen, act, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import GridWrapper from "../components/GridWrapper";
import LangstonGrid from "../LangstonGrid";
import StepController from "../controllers/StepController";
import axios from "axios";

// ---------------------------------------------------------------------------
// Canvas stub
// ---------------------------------------------------------------------------

const mockCtx = { fillRect: jest.fn(), fillStyle: "" as string };
beforeAll(() => {
  Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
    value: jest.fn(() => mockCtx),
    configurable: true,
  });
});

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

jest.mock("../LangstonGrid", () => jest.fn());
jest.mock("../controllers/StepController", () => jest.fn());
jest.mock("axios", () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
}));

const MockLangstonGrid = LangstonGrid as unknown as jest.Mock;
const mockAxiosGet = axios.get as jest.Mock;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeFakeController(): StepController {
  return {
    render: () => <button>PLAY</button>,
    subscribe: jest.fn(() => () => {}),
    renderCallback: null,
    toggle: false,
    stepSpeed: 5,
    stepNum: 0,
    stop: jest.fn(),
    unsubscribeAll: jest.fn(),
    onToggle: jest.fn(),
  } as unknown as StepController;
}

const DEFAULT_PROPS = {
  title: "Test Grid",
  width: 100,
  height: 100,
  gridDimensions: "10x10",
};

// The most recent onReady callback captured by the LangstonGrid mock.
let capturedOnReady: ((ctrl: StepController) => void) | undefined;

function setupMocks() {
  capturedOnReady = undefined;
  MockLangstonGrid.mockClear();
  mockAxiosGet.mockResolvedValue({ data: '{"rules":{}}' });

  MockLangstonGrid.mockImplementation(
    (_type: string, _dims: string, _w: number, _h: number,
     _ref: unknown, onReady?: (ctrl: StepController) => void) => {
      capturedOnReady = onReady;
      return {
        controller: undefined,
        renderCanvas: jest.fn(),
        doneInit: false,
      };
    }
  );
}

/** Render GridWrapper and advance it to the "ready" state. */
async function renderReady(props: Partial<typeof DEFAULT_PROPS & { initialType?: string }> = {}) {
  setupMocks();
  render(<GridWrapper {...DEFAULT_PROPS} {...props} />);
  // The initial useEffect fires synchronously inside render's act() wrapper,
  // so capturedOnReady is already set here. Firing it transitions to "ready".
  await act(async () => { capturedOnReady?.(makeFakeController()); });
}

// ---------------------------------------------------------------------------
// Default type
// ---------------------------------------------------------------------------

describe("GridWrapper — default ant type", () => {
  it('passes "ant" to LangstonGrid when no initialType is given', () => {
    setupMocks();
    render(<GridWrapper {...DEFAULT_PROPS} />);
    expect(MockLangstonGrid.mock.calls[0][0]).toBe("ant");
  });

  it("respects a custom initialType prop", () => {
    setupMocks();
    render(<GridWrapper {...DEFAULT_PROPS} initialType="plant" />);
    expect(MockLangstonGrid.mock.calls[0][0]).toBe("plant");
  });

  it('shows "Classic" as the selected option by default', async () => {
    await renderReady();
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("ant");
  });
});

// ---------------------------------------------------------------------------
// AntTypeController drives the type used when generating a new ant
// ---------------------------------------------------------------------------

describe("GridWrapper — AntTypeController: new ant uses selected type", () => {
  async function selectTypeAndGenerate(type: string) {
    await renderReady();

    fireEvent.change(screen.getByRole("combobox"), { target: { value: type } });

    await act(async () => {
      fireEvent.click(screen.getByText("Generate New Ant"));
    });

    // Return the type argument of the most recent LangstonGrid constructor call.
    const calls = MockLangstonGrid.mock.calls;
    return calls[calls.length - 1][0] as string;
  }

  it('creates LangstonGrid with "random" when Random is selected', async () => {
    expect(await selectTypeAndGenerate("random")).toBe("random");
  });

  it('creates LangstonGrid with "plant" when Plant is selected', async () => {
    expect(await selectTypeAndGenerate("plant")).toBe("plant");
  });

  it('creates LangstonGrid with "ant" when Classic is selected', async () => {
    expect(await selectTypeAndGenerate("ant")).toBe("ant");
  });

  it("changing type does not immediately create a new LangstonGrid", async () => {
    await renderReady();
    const callsBefore = MockLangstonGrid.mock.calls.length;

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "random" } });

    expect(MockLangstonGrid.mock.calls.length).toBe(callsBefore);
  });

  it("creates a new LangstonGrid on each generate click (different types)", async () => {
    jest.useFakeTimers();
    try {
      await renderReady();
      const initialCalls = MockLangstonGrid.mock.calls.length;

      // Generate a "random" ant
      fireEvent.change(screen.getByRole("combobox"), { target: { value: "random" } });
      await act(async () => { fireEvent.click(screen.getByText("Generate New Ant")); });

      // Make it ready, then tick the cooldown down one second at a time
      await act(async () => { capturedOnReady?.(makeFakeController()); });
      for (let i = 0; i < 5; i++) {
        await act(async () => { jest.advanceTimersByTime(1000); });
      }

      // Generate a "plant" ant
      fireEvent.change(screen.getByRole("combobox"), { target: { value: "plant" } });
      await act(async () => { fireEvent.click(screen.getByText("Generate New Ant")); });

      const newCalls = MockLangstonGrid.mock.calls.slice(initialCalls);
      expect(newCalls[0][0]).toBe("random");
      expect(newCalls[1][0]).toBe("plant");
    } finally {
      jest.useRealTimers();
    }
  });
});

// ---------------------------------------------------------------------------
// Cooldown blocks re-generation
// ---------------------------------------------------------------------------

describe("GridWrapper — cooldown", () => {
  it("hides controls and shows loading while a new ant is being generated", async () => {
    await renderReady();

    await act(async () => {
      fireEvent.click(screen.getByText("Generate New Ant"));
    });

    // Controls are hidden while loading; loading indicator is shown instead
    expect(screen.queryByText("Generate New Ant")).not.toBeInTheDocument();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("re-enables the Generate button once the new ant is ready", async () => {
    await renderReady();

    await act(async () => {
      fireEvent.click(screen.getByText("Generate New Ant"));
    });
    await act(async () => { capturedOnReady?.(makeFakeController()); });

    const btn = screen.getByRole("button", { name: "Generate New Ant" });
    expect(btn).toBeEnabled();
  });
});

// ---------------------------------------------------------------------------
// Loading / ready state
// ---------------------------------------------------------------------------

describe("GridWrapper — loading state", () => {
  it('shows "Loading..." on initial render before onReady fires', () => {
    setupMocks();
    render(<GridWrapper {...DEFAULT_PROPS} />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("shows the type selector and generate button once ready", async () => {
    await renderReady();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByText("Generate New Ant")).toBeInTheDocument();
  });

  it("renders the title", async () => {
    await renderReady();
    expect(screen.getByText("Test Grid")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// PromptController visibility driven by GridContext
// ---------------------------------------------------------------------------

// PromptController: shows only for "random"
// AntConfigController: shows only for "custom"
describe("GridWrapper — controller visibility via GridContext", () => {
  it('shows no textbox for "ant"', async () => {
    await renderReady();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it('shows no textbox for "plant"', async () => {
    await renderReady();
    await act(async () => {
      fireEvent.change(screen.getByRole("combobox"), { target: { value: "plant" } });
    });
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it('shows the prompt textarea for "random"', async () => {
    await renderReady();
    await act(async () => {
      fireEvent.change(screen.getByRole("combobox"), { target: { value: "random" } });
    });
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it('shows the config textarea for "custom"', async () => {
    await renderReady();
    await act(async () => {
      fireEvent.change(screen.getByRole("combobox"), { target: { value: "custom" } });
    });
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it('hides the prompt when switching from "random" back to "ant"', async () => {
    await renderReady();
    await act(async () => {
      fireEvent.change(screen.getByRole("combobox"), { target: { value: "random" } });
    });
    expect(screen.getByRole("textbox")).toBeInTheDocument();

    await act(async () => {
      fireEvent.change(screen.getByRole("combobox"), { target: { value: "ant" } });
    });
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it('swaps from prompt to config when switching "random" → "custom"', async () => {
    await renderReady();
    await act(async () => {
      fireEvent.change(screen.getByRole("combobox"), { target: { value: "random" } });
    });
    expect(screen.getByPlaceholderText(/Describe an ant/)).toBeInTheDocument();

    await act(async () => {
      fireEvent.change(screen.getByRole("combobox"), { target: { value: "custom" } });
    });
    expect(screen.queryByPlaceholderText(/Describe an ant/)).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText(/\"rules\"/)).toBeInTheDocument();
  });
});
