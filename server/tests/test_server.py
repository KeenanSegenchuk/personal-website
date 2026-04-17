"""
Tests for server.py (Flask routes).

Routes tested:
  GET /api/langton/ant_config/<n_colors>
    - n_colors == 0  → returns the default template string directly (no OpenAI call)
    - n_colors  > 0  → calls get_config() with the prompt from rand_ant_prompt()
                       and returns its response verbatim
"""

import pytest
import server
from unittest.mock import patch, MagicMock

MOCK_CONFIG = (
    '{"defaultRule":{"turn":"straight","flipTo":0},'
    '"rules":{"0":{"turn":"right","flipTo":1},"1":{"turn":"left","flipTo":0}},'
    '"startDirection":"N","startColor":0}'
)


# ---------------------------------------------------------------------------
# n_colors == 0  (default template, no AI call)
# ---------------------------------------------------------------------------

def test_ant_config_zero_returns_200(client):
    response = client.get("/api/langton/ant_config/0")
    assert response.status_code == 200


def test_ant_config_zero_returns_template_content(client):
    """The default template should contain the key fields of an ant config."""
    response = client.get("/api/langton/ant_config/0")
    body = response.data.decode()
    assert "rules" in body
    assert "defaultRule" in body


def test_ant_config_zero_does_not_call_openai(client):
    """n_colors=0 should short-circuit and never call get_config."""
    with patch("server.get_config") as mock_get:
        client.get("/api/langton/ant_config/0")
        mock_get.assert_not_called()


# ---------------------------------------------------------------------------
# n_colors > 0  (AI-generated config)
# ---------------------------------------------------------------------------

def test_ant_config_nonzero_returns_200(client):
    with patch("server.get_config", return_value=MOCK_CONFIG):
        response = client.get("/api/langton/ant_config/3")
    assert response.status_code == 200


def test_ant_config_nonzero_returns_get_config_response(client):
    """The route should pass through whatever get_config returns."""
    with patch("server.get_config", return_value=MOCK_CONFIG):
        response = client.get("/api/langton/ant_config/3")
    assert response.data.decode() == MOCK_CONFIG


def test_ant_config_nonzero_calls_get_config_once(client):
    with patch("server.get_config", return_value=MOCK_CONFIG) as mock_get:
        client.get("/api/langton/ant_config/2")
    mock_get.assert_called_once()


def test_ant_config_nonzero_passes_n_colors_in_prompt(client):
    """rand_ant_prompt embeds n_colors in its prompt string; confirm it reaches get_config."""
    with patch("server.get_config", return_value=MOCK_CONFIG) as mock_get:
        client.get("/api/langton/ant_config/5")
    _, kwargs = mock_get.call_args
    positional = mock_get.call_args.args
    # second positional arg is the prompt
    combined_prompt = positional[1] if positional else kwargs.get("prompt", "")
    assert "5" in combined_prompt


# ---------------------------------------------------------------------------
# Rate limiting
# ---------------------------------------------------------------------------

@pytest.fixture(autouse=True)
def clear_rate_limit_state():
    """Reset the in-memory rate-limit dict between tests so they don't interfere."""
    server._last_call.clear()
    yield
    server._last_call.clear()


def test_rate_limit_first_request_allowed(client):
    response = client.get("/api/langton/ant_config/0")
    assert response.status_code == 200


def test_rate_limit_second_request_blocked(client):
    client.get("/api/langton/ant_config/0")
    response = client.get("/api/langton/ant_config/0")
    assert response.status_code == 429


def test_rate_limit_response_contains_retry_after(client):
    client.get("/api/langton/ant_config/0")
    response = client.get("/api/langton/ant_config/0")
    body = response.get_json()
    assert "retry_after" in body
    assert body["retry_after"] > 0


def test_rate_limit_resets_after_window(client):
    """After the rate-limit window passes, the next request is allowed."""
    now = 1000.0
    with patch("server.time", return_value=now):
        client.get("/api/langton/ant_config/0")
    # Advance time past the limit window
    with patch("server.time", return_value=now + server.RATE_LIMIT_SECONDS):
        response = client.get("/api/langton/ant_config/0")
    assert response.status_code == 200


def test_rate_limit_does_not_call_openai_when_blocked(client):
    client.get("/api/langton/ant_config/0")
    with patch("server.get_config") as mock_get:
        client.get("/api/langton/ant_config/3")
    mock_get.assert_not_called()


# ---------------------------------------------------------------------------
# STUB: edge cases — clarification needed
# ---------------------------------------------------------------------------

# STUB: What should happen for n_colors=1?
# Flask's <int:n_colors> will route this to ant_config(1), which calls get_config.
# Is a 1-color ant config meaningful? (only a defaultRule, no color-specific rules)
# def test_ant_config_one_color(client):
#     pass


# STUB: What should the route return if get_config raises an exception
# (e.g. OpenAI is unreachable or returns malformed output)?
# Should it return a 500, a fallback config, or propagate the error?
# def test_ant_config_get_config_raises(client):
#     with patch("server.get_config", side_effect=Exception("API error")):
#         response = client.get("/api/langton/ant_config/3")
#     # assert response.status_code == ???
#     pass


# STUB: Flask's <int:> converter uses the regex \d+ so negative integers
# should NOT match the route and should return 404. Confirm this is the
# intended behaviour (vs. treating negatives as 0 or erroring gracefully).
# def test_ant_config_negative_n_colors_returns_404(client):
#     response = client.get("/api/langton/ant_config/-1")
#     assert response.status_code == 404
