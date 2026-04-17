# Testing

## Run all tests

From the repo root:
```bash
(cd server && python3 -m pytest) && (cd client && CI=true npm test -- --testPathPattern="Langton/__tests__")
```

> The `--testPathPattern` flag skips `App.test.tsx`, which is a CRA-generated placeholder that fails until `npm install` is run.

## Running the tests

### Backend (Python / pytest)

Install test dependencies (one-time):
```bash
cd server
pip install pytest pytest-flask
```

Run all backend tests:
```bash
cd server
pytest
```

Run a single test file:
```bash
pytest tests/test_server.py
pytest tests/test_configBot.py
```

Run a single test by name:
```bash
pytest tests/test_server.py::test_ant_config_zero_returns_template_content
```

Verbose output:
```bash
pytest -v
```

### Frontend (Jest / React Testing Library)

Run all frontend tests (watch mode):
```bash
cd client
npm test
```

Run once without watch (CI mode):
```bash
cd client
CI=true npm test
```

Run a single test file:
```bash
cd client
npm test -- Langston.test.ts
```

Run tests matching a name pattern:
```bash
cd client
npm test -- -t "multi-step trace"
```

---

## What each test file covers

### `server/tests/test_server.py`

Tests the Flask route `GET /api/langton/ant_config/<n_colors>`.

| Test | What it checks |
|------|---------------|
| `test_ant_config_zero_returns_200` | n_colors=0 gives a 200 response |
| `test_ant_config_zero_returns_template_content` | Response body contains `rules` and `defaultRule` |
| `test_ant_config_zero_does_not_call_openai` | n_colors=0 short-circuits before calling `get_config` |
| `test_ant_config_nonzero_returns_200` | n_colors>0 gives a 200 (with `get_config` mocked) |
| `test_ant_config_nonzero_returns_get_config_response` | Route passes `get_config`'s return value straight to the client |
| `test_ant_config_nonzero_calls_get_config_once` | `get_config` is called exactly once per request |
| `test_ant_config_nonzero_passes_n_colors_in_prompt` | The n_colors value appears in the prompt string passed to `get_config` |

**Stubs (pending clarification):**
- `test_ant_config_negative_n_colors_returns_404` — Flask's `<int:>` converter uses `\d+` and likely rejects negative integers with a 404. Needs confirmation.
- `test_ant_config_get_config_raises` — no error handling exists today. What should the route return if OpenAI is unreachable?

---

### `server/tests/test_configBot.py`

Tests `rand_ant_prompt()` and `get_config()` in `configBot.py`.

| Test | What it checks |
|------|---------------|
| `test_rand_ant_prompt_returns_required_keys` | Returns dict with `instructions`, `prompt`, `template` |
| `test_rand_ant_prompt_template_contains_default_template` | `template` field matches `default_template` |
| `test_rand_ant_prompt_instructions_match_default` | `instructions` field matches `default_instructions` |
| `test_rand_ant_prompt_embeds_n_colors_in_prompt` | The number of colors appears as text in the prompt |
| `test_rand_ant_prompt_zero_colors_still_returns_structure` | n_colors=0 still returns a valid dict |
| `test_rand_ant_prompt_template_contains_rules` | Template string contains `rules` and `defaultRule` |
| `test_get_config_typo_raises` | **Documents a known bug**: `client.resposes` (line 28) should be `client.responses` — calling the real function raises `AttributeError` |
| `test_get_config_returns_response_text` | With OpenAI mocked, `get_config` returns `response.output[1].content[0].text` |
| `test_get_config_uses_o4_mini_model` | Passes `model="o4-mini"` to the API |
| `test_get_config_passes_instructions` | Passes the instructions argument through to the API call |

**Stubs (pending clarification):**
- `test_default_template_is_valid_json` — `default_template` uses unquoted keys (not valid JSON). `CustomAnt.parseAntDefinition()` uses `JSON.parse()`, so this template will fail to parse. Should the template use quoted keys, or should the parser be lenient?
- `test_get_config_handles_missing_output_index` — if the OpenAI response has fewer than 2 output items, `response.output[1]` raises `IndexError`. Should this be caught?

---

### `client/src/Langton/__tests__/Langston.test.ts`

Tests `LangstonAnt` and `CustomAnt` from `Langston.ts`.

**LangstonAnt — constructor / init:**
Verifies ant is placed at grid centre, initial direction is East `[0,1]`, and `storedUpdates` is pre-populated with all cells.

**LangstonAnt — consumeUpdates:**
Verifies the method returns the current updates, clears `storedUpdates`, and returns a copy (not a reference).

**LangstonAnt — step on black cell (color=0):**
On a black cell the ant turns left (East → North `[-1,0]`), flips the cell to white, moves forward, and records the changed cell in `storedUpdates`.

**LangstonAnt — step on white cell (color=1):**
On a white cell the ant turns right (East → South `[1,0]`), flips the cell to black, and moves forward.

**LangstonAnt — edge wrapping:**
Four tests (top, bottom, left, right) confirm the ant wraps to the opposite edge instead of going out of bounds.

**LangstonAnt — multi-step trace:**
Traces the first 5 steps against a hand-verified expected path on a 5×5 all-black grid, confirming the ant makes the characteristic small square before diverging.

**CustomAnt.parseAntDefinition:**
Confirms valid JSON is parsed correctly, and that malformed JSON or a missing `rules` field throw.

**CustomAnt — constructor:**
Ant placed at grid centre; `startDirection: "N"` maps to `[1,0]` per the source's direction table.

**CustomAnt — step: rule application:**
Correct rule applied for color 0, color 1, and an unknown color (falls back to `defaultRule`).

**CustomAnt — turn directions:**
`right`, `left`, and `reverse` turns produce the geometrically correct new direction vector.

**CustomAnt — edge wrapping:**
Confirms the ant wraps at the grid boundary (mirrors LangstonAnt wrap tests).

**Stubs (pending clarification):**
- `straight` turn — `turnAnt()` currently returns `[0,0]` for `"straight"` instead of keeping the current direction. The ant becomes stuck. Almost certainly a bug; stub is left failing until the expected behaviour is confirmed.
- `storedUpdates` after step — `CustomAnt.step()` never pushes to `storedUpdates`. After the first `consumeUpdates()` call drains the initial snapshot, the canvas will never repaint. Stub documents the missing push.

---

### `client/src/Langton/__tests__/Stepper.test.ts`

Tests `StepController` from `Stepper.ts`.

`requestAnimationFrame` and `performance.now` are replaced with Jest mocks so time can be advanced deterministically without real timers.

**Constructor:** Default speed set, `toggle=false`, `stepNum=0`.

**onToggle:** Starts/stops the loop, queues/stops rAF, notifies listeners.

**loop — step counting:**
- No steps called when paused.
- Exactly N steps called after N intervals of elapsed time (e.g. 10 Hz → 1 step per 100 ms).
- `stepNum` tracks total steps.
- rAF is re-queued each tick while running, not re-queued after stopping.
- `renderCallback` is called after stepping.

**setStepSpeed:** Updates `stepSpeed`, notifies listeners, and the new speed is immediately reflected in step timing.

**subscribe / notify:** All registered listeners are called; listeners registered after a `notify()` call are not retroactively invoked.

**Stubs (pending clarification):**
- `stepSpeed=0` — `stepInterval` becomes `Infinity`, so steps are never called. Is this the intended "freeze via speed" behaviour, or should 0 be rejected?
- Negative `stepSpeed` — `stepInterval` is negative, causing an infinite `while` loop in `loop()`. Should negative values be clamped or throw?

---

## Known bugs uncovered by tests

| Location | Bug | Test that documents it |
|----------|-----|----------------------|
| `server/configBot.py:28` | `client.resposes` typo (should be `client.responses`) — every real call raises `AttributeError` | `test_get_config_typo_raises` |
| `client/src/Langton/Langston.ts` (turnAnt) | `"straight"` turn returns `[0,0]` instead of preserving direction — ant freezes in place | `Stepper.test.ts` stub + comment in `Langston.test.ts` |
| `client/src/Langton/Langston.ts` (CustomAnt.step) | Never pushes to `storedUpdates` — canvas does not repaint after first frame | stub in `Langston.test.ts` |
| `server/configBot.py` (default_template) | Template uses unquoted JSON keys — `JSON.parse()` in `CustomAnt.parseAntDefinition` will reject the backend's n_colors=0 response | stub in `test_configBot.py` |
