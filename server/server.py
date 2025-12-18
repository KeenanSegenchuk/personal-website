from flask import Flask, Blueprint, request, send_from_directory, jsonify, make_response
from flask_cors import CORS
from configBot import get_config, rand_ant_prompt

app = Flask(__name__)
CORS(app)

# ROUTES
langton_bp = Blueprint("langton", __name__, url_prefix="/api/langton")
fridge_bp = Blueprint("fridge", __name__, url_prefix="/api/fridge")



# LANGTON
@langton_bp.route("ant_config/<int:n_colors>")
def ant_config(n_colors):
	prompt = rand_ant_prompt(n_colors)
	if n_colors == 0:
		#get default Langton's Ant config
		return prompt["template"]

	ant_conf = get_config(prompt["instructions"], prompt["prompt"] + " Template: " + prompt["template"])
	print(f"New Ant: {ant_conf}")
	return ant_conf

app.register_blueprint(langton_bp)
app.register_blueprint(fridge_bp)

if __name__ == "__main__":
	app.run(host="0.0.0.0", port=5000)
