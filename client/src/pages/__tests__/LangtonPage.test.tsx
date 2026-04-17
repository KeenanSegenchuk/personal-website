/**
 * Tests for LangtonPage.tsx
 *
 * Covers page-level behaviour:
 *   - Initial render (ant type, button enabled)
 *   - "Generate New Ant" switches grid to type random
 *   - Cooldown: button disabled + countdown label during 5-second window
 *   - Cooldown: button re-enables after window expires (advances 1 s at a time
 *     so each setTimeout/useEffect chain flushes between ticks)
 *   - Background random values are stable across re-renders
 *
 * GridWrapper and both background components are mocked to isolate page logic.
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import LangtonPage from '../LangtonPage';

// ---------- Module mocks ----------

jest.mock('../../components/GridWrapper', () => ({
  __esModule: true,
  default: ({ type, title }: { type: string; title: string }) => (
    <div data-testid="grid-wrapper" data-type={type}>{title}</div>
  ),
}));

jest.mock('../../static/backgrounds/WaveBackground', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('../../static/backgrounds/CloudLeafBackground', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// ---------- Helpers ----------

function getButton() {
  return screen.getByRole('button', { name: /Generate New Ant/i });
}

/** Advance fake timers by 1-second ticks, flushing React state between each. */
function advanceCooldown(seconds: number) {
  for (let i = 0; i < seconds; i++) {
    act(() => { jest.advanceTimersByTime(1000); });
  }
}

// ---------- Initial render ----------

describe('LangtonPage — initial render', () => {
  it('renders the Generate New Ant button', () => {
    render(<LangtonPage />);
    expect(getButton()).toBeInTheDocument();
  });

  it('button is enabled on first render', () => {
    render(<LangtonPage />);
    expect(getButton()).not.toBeDisabled();
  });

  it('renders GridWrapper with type "ant" initially', () => {
    render(<LangtonPage />);
    expect(screen.getByTestId('grid-wrapper')).toHaveAttribute('data-type', 'ant');
  });

  it('button label does not contain a countdown on first render', () => {
    render(<LangtonPage />);
    expect(getButton()).not.toHaveTextContent(/\ds/);
  });
});

// ---------- Generate New Ant ----------

describe('LangtonPage — Generate New Ant', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('switches GridWrapper to type "random" after click', () => {
    render(<LangtonPage />);
    fireEvent.click(getButton());
    expect(screen.getByTestId('grid-wrapper')).toHaveAttribute('data-type', 'random');
  });

  it('disables the button immediately after click', () => {
    render(<LangtonPage />);
    fireEvent.click(getButton());
    expect(getButton()).toBeDisabled();
  });

  it('shows a countdown label immediately after click', () => {
    render(<LangtonPage />);
    fireEvent.click(getButton());
    expect(getButton()).toHaveTextContent(/5s/);
  });

  it('decrements the countdown each second', () => {
    render(<LangtonPage />);
    fireEvent.click(getButton());

    advanceCooldown(1);
    expect(getButton()).toHaveTextContent('4s');

    advanceCooldown(1);
    expect(getButton()).toHaveTextContent('3s');
  });

  it('re-enables the button after the full cooldown expires', () => {
    render(<LangtonPage />);
    fireEvent.click(getButton());

    advanceCooldown(5);

    expect(getButton()).not.toBeDisabled();
    expect(getButton()).toHaveTextContent('Generate New Ant');
  });

  it('ignores clicks during cooldown (button is disabled)', () => {
    render(<LangtonPage />);
    fireEvent.click(getButton());               // first click: type → random
    const gridAfterFirst = screen.getByTestId('grid-wrapper').getAttribute('data-type');

    // Attempt second click while disabled
    fireEvent.click(getButton());
    expect(screen.getByTestId('grid-wrapper')).toHaveAttribute('data-type', gridAfterFirst);
  });

  it('allows another generation after the cooldown expires', () => {
    render(<LangtonPage />);
    fireEvent.click(getButton());
    advanceCooldown(5);
    expect(getButton()).not.toBeDisabled();

    fireEvent.click(getButton());
    expect(getButton()).toBeDisabled();
  });
});

// ---------- Background stability ----------

describe('LangtonPage — background random values stable across re-renders', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('does not call Math.random after mount', () => {
    render(<LangtonPage />);

    const spy = jest.spyOn(Math, 'random');

    fireEvent.click(getButton());
    advanceCooldown(3); // several cooldown ticks = several re-renders

    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
