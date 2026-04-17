import os
from time import time
from urllib.parse import unquote
from flask import Flask, Blueprint, request, send_from_directory, jsonify, make_response
from flask_cors import CORS
from configBot import get_config, rand_ant_prompt

SAVED_ANTS_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'client', 'public', 'Saved Ants.txt')

app = Flask(__name__)
CORS(app)

# ROUTES
langton_bp = Blueprint("langton", __name__, url_prefix="/api/langton")
fridge_bp = Blueprint("fridge", __name__, url_prefix="/api/fridge")

# Per-IP rate limiting for configBot calls (seconds between allowed calls)
RATE_LIMIT_SECONDS = 5
_last_call: dict[str, float] = {}


# LANGTON
@langton_bp.route("ant_config/<int:n_colors>")
def ant_config(n_colors):
    ip = request.remote_addr
    now = time()
    last = _last_call.get(ip, 0)
    if now - last < RATE_LIMIT_SECONDS:
        retry_after = round(RATE_LIMIT_SECONDS - (now - last), 2)
        return {"error": "rate limited", "retry_after": retry_after}, 429
    _last_call[ip] = now
    prompt = rand_ant_prompt(n_colors)
    if n_colors == 0:
        return prompt["template"]
    ant_conf = get_config(prompt["instructions"], prompt["prompt"] + " Template: " + prompt["template"])
    print(f"New Ant: {ant_conf}")
    return ant_conf

@langton_bp.route("/ant_config/<int:n_colors>/<string:user_prompt>")
def prompted_ant_config(n_colors, user_prompt):
    ip = request.remote_addr
    now = time()
    last = _last_call.get(ip, 0)
    if now - last < RATE_LIMIT_SECONDS:
        retry_after = round(RATE_LIMIT_SECONDS - (now - last), 2)
        return {"error": "rate limited", "retry_after": retry_after}, 429
    _last_call[ip] = now
    prompt = rand_ant_prompt(n_colors, unquote(user_prompt))
    if n_colors == 0:
        return prompt["template"]
    ant_conf = get_config(prompt["instructions"], prompt["prompt"] + " Template: " + prompt["template"])
    print(f"New Ant: {ant_conf}")
    return ant_conf

@langton_bp.route("/save_config", methods=["POST"])
def save_config():
	data = request.get_json()
	name = (data.get("name") or "unnamed").strip()
	config = (data.get("config") or "").strip()
	if not config:
		return {"error": "no config provided"}, 400
	with open(SAVED_ANTS_PATH, "a", encoding="utf-8") as f:
		f.write(f"{name}: {config}\n")
	return {"ok": True}

app.register_blueprint(langton_bp)
app.register_blueprint(fridge_bp)


if __name__ == "__main__":
	#Development server:
	app.run(debug=True)
