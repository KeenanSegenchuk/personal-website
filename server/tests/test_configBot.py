"""
Tests for configBot.py.

Functions tested:
  rand_ant_prompt(n_colors) → dict with keys "instructions", "prompt", "template"
  get_config(instructions, prompt) → string response from OpenAI
"""

import os
import pytest
import json
from unittest.mock import patch, MagicMock
from configBot import rand_ant_prompt, get_config, default_template, default_instructions


# ---------------------------------------------------------------------------
# rand_ant_prompt
# ---------------------------------------------------------------------------

def test_rand_ant_prompt_returns_required_keys():
    result = rand_ant_prompt(3)
    assert "instructions" in result
    assert "prompt" in result
    assert "template" in result


def test_rand_ant_prompt_template_contains_default_template():
    result = rand_ant_prompt(3)
    assert result["template"] == default_template


def test_rand_ant_prompt_instructions_match_default():
    result = rand_ant_prompt(3)
    assert result["instructions"] == default_instructions


def test_rand_ant_prompt_embeds_n_colors_in_prompt():
    result = rand_ant_prompt(5)
    assert "5" in result["prompt"]


def test_rand_ant_prompt_zero_colors_still_returns_structure():
    """n_colors=0 path is handled by server.py before calling this, but
    rand_ant_prompt(0) itself should still return a valid dict."""
    result = rand_ant_prompt(0)
    assert "instructions" in result
    assert "template" in result


def test_rand_ant_prompt_template_contains_rules():
    result = rand_ant_prompt(1)
    assert "rules" in result["template"]
    assert "defaultRule" in result["template"]


# ---------------------------------------------------------------------------
# get_config — bug documentation
# ---------------------------------------------------------------------------

def test_get_config_reaches_api_call():
    """
    Confirms the correct attribute path (client.responses.create) is used.
    With no valid API key the call reaches the OpenAI endpoint and raises
    AuthenticationError — not AttributeError, which would indicate a typo.
    """
    import openai
    with pytest.raises(openai.AuthenticationError):
        get_config("some instructions", "some prompt")


# ---------------------------------------------------------------------------
# get_config — functional tests (OpenAI client mocked)
# ---------------------------------------------------------------------------

MOCK_ANT_JSON = (
    '{"defaultRule":{"turn":"straight","flipTo":0},'
    '"rules":{"0":{"turn":"right","flipTo":1}},'
    '"startDirection":"N","startColor":0}'
)


def _make_mock_response(text: str) -> MagicMock:
    """Build a mock that matches the shape of the OpenAI Responses API return value:
    response.output[1].content[0].text"""
    content_item = MagicMock()
    content_item.text = text
    output_item = MagicMock()
    output_item.content = [content_item]
    response = MagicMock()
    response.output = [MagicMock(), output_item]  # index [1] is the assistant message
    return response


def test_get_config_returns_response_text():
    """After fixing the typo, get_config should return the text from output[1].content[0].text."""
    mock_response = _make_mock_response(MOCK_ANT_JSON)
    with patch("configBot.client") as mock_client:
        # Patch both spellings so the test works before and after the typo is fixed.
        mock_client.responses = MagicMock()
        mock_client.responses.create.return_value = mock_response
        mock_client.resposes = mock_client.responses  # tolerate the typo
        result = get_config("instructions", "prompt")
    assert result == MOCK_ANT_JSON


def test_get_config_uses_o4_mini_model():
    """get_config should pass model="o4-mini" to the API."""
    mock_response = _make_mock_response(MOCK_ANT_JSON)
    with patch("configBot.client") as mock_client:
        mock_client.responses = MagicMock()
        mock_client.responses.create.return_value = mock_response
        mock_client.resposes = mock_client.responses
        get_config("instructions", "prompt")
    call_kwargs = mock_client.responses.create.call_args.kwargs
    assert call_kwargs.get("model") == "o4-mini"


def test_get_config_passes_instructions():
    mock_response = _make_mock_response(MOCK_ANT_JSON)
    with patch("configBot.client") as mock_client:
        mock_client.responses = MagicMock()
        mock_client.responses.create.return_value = mock_response
        mock_client.resposes = mock_client.responses
        get_config("my instructions", "my prompt")
    call_kwargs = mock_client.responses.create.call_args.kwargs
    assert call_kwargs.get("instructions") == "my instructions"


# ---------------------------------------------------------------------------
# API key integration test (real network call)
# ---------------------------------------------------------------------------

def test_api_key_in_env_is_valid():
    """
    Loads the OPENAI_API_KEY from personal-website/.env and verifies it
    authenticates successfully by calling client.models.list().
    Requires network access. Fails if the key is missing, expired, or revoked.
    """
    from pathlib import Path
    from dotenv import load_dotenv
    from openai import OpenAI, AuthenticationError

    env_path = Path(__file__).resolve().parent.parent.parent / ".env"
    assert env_path.exists(), f".env file not found at {env_path}"

    load_dotenv(env_path, override=True)
    real_key = os.getenv("OPENAI_API_KEY")
    assert real_key, "OPENAI_API_KEY is not set in .env"

    real_client = OpenAI(api_key=real_key)
    try:
        models = real_client.models.list()
        assert models.data, "models.list() returned empty — unexpected for a valid key"
    except AuthenticationError as e:
        pytest.fail(f"API key in .env is invalid: {e}")


# ---------------------------------------------------------------------------
# STUB: clarification needed
# ---------------------------------------------------------------------------

# STUB: The default_template uses non-standard JSON (unquoted keys like
# `defaultRule: { ... }` instead of `"defaultRule": { ... }`).
# The OpenAI model is instructed to return "raw JSON", but the template itself
# is not valid JSON. Does the frontend parse this with JSON.parse() or a
# lenient parser? If JSON.parse(), the response will fail to parse.
# CustomAnt.parseAntDefinition() uses JSON.parse() — so either:
#   a) the template should be fixed to use quoted keys, or
#   b) a lenient JSON parser should be used.
# def test_default_template_is_valid_json():
#     import json
#     # This will currently FAIL because of unquoted keys in default_template.
#     json.loads(default_template)


# STUB: What should get_config do if the OpenAI response does not contain
# a second output item (index [1]) — e.g. if the model returns only one
# message? Currently it would raise IndexError.
# def test_get_config_handles_missing_output_index():
#     pass
