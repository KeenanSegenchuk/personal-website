import os, json
from dotenv import load_dotenv
from pathlib import Path

# Load ../.env (relative to this file)
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(env_path)

from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

default_instructions = """You are an AI designed to create life. You will be provided a template for controlling an agent on a colored grid world,
				please follow the specifications and template in the prompt to create a configuration for a new agent. Make sure your response 
				only contains raw JSON and follows the exact layout of the template."""
default_template = """{
  "defaultRule": { "turn": "straight", "flipTo": 0 },
  "rules": {
    "0": { "turn": "right", "flipTo": 1 },
    "1": { "turn": "left", "flipTo": 0 }
  },
  "startDirection": "N",
  "startColor": 1
}"""


def rand_ant_prompt(n_colors, prompt = ""):
	return {"instructions": default_instructions,
		"prompt": f"""Modify this default configuration for a Langton's Ant. Make the rules mostly random, but if you see an opportunity to create some 
			cool behaviour you can. There are {n_colors} colors available to the grid, so make at most that many rules. If the agent lands
			on a color that it doesn't have a rule for, then it will use the defaultRule.{(" The president offers you these words of inspiration: " + prompt) if prompt != "" else ""}""",
		"template": default_template}
		

def get_config(instructions, prompt):
	response = client.responses.create(
		model="o4-mini",
		instructions=instructions,
		input=prompt
	)

	response = response.output[1].content[0].text
	return response

