type Ant = {
  pos: [number, number];
  dir: [number, number];
};

type TurnDirection = "left" | "right" | "straight" | "reverse";
type tuple = [number, number];

interface AntRule {
  turn: TurnDirection;    // which way to turn
  flipTo: number;         // what color the cell becomes
}

interface AntDefinition {
  defaultRule: AntRule;  //default to this rule if color not in rules
  rules: Record<number, AntRule>;       // rules for colors 
  startDirection: "N" | "E" | "S" | "W";
  startColor: string;     // optional default color of blank cells
}


export abstract class Langston {

	//stores gridworld and updates queued for render

	grid: number[][];
	storedUpdates: Set<string> = new Set();
	abstract step():void;

	constructor(grid: number[][], staring_pos: number[]) {
		this.grid = grid;
		this.initUpdates();
	}
	initUpdates():void {
		this.grid.forEach((row, i) => {
			row.forEach((_cell, j) => {
				this.pushUpdate([i, j]);
			});
		});
	}

	protected pushUpdate(pos: [number, number]):void {
		this.storedUpdates.add(`${pos[0]},${pos[1]}`);
	}

	consumeUpdates():[number, number][] {
		const res = [...this.storedUpdates].map(k => {
			const [a, b] = k.split(",").map(Number);
			return [a, b] as [number, number];
		});
		this.storedUpdates = new Set();
		return res;
	}
		
	protected static dtov(dir: "N" | "E" | "S" | "W"): tuple {
		const dirs: Record<"N" | "E" | "S" | "W", [number, number]> = {
		  N: [1, 0],
		  E: [0, 1],
		  S: [-1, 0],
		  W: [0, -1],
		};
		return dirs[dir];
	}

	protected static turnAnt(dir: number[], turnDir: TurnDirection): tuple {
		if (turnDir === "left") {
			return [-dir[1], dir[0]];
		} else if (turnDir === "right") {
			return [dir[1], -dir[0]];
		} else if (turnDir === "reverse") {
			return [-dir[0], -dir[1]];
		}
		return [dir[0], dir[1]] as tuple; // straight
	}
}

export class LangstonAnt extends Langston {
	ant: Ant

	//grid w and l. I gues I used x and y so I could mentally match the axes better
	x: number
	y: number

	constructor(grid: number[][], starting_pos: number[]) 
	{
		super(grid);
		[this.x, this.y] = [grid.length, grid[0]!.length];
		//vvvvv this might be necessary but seemed weird vvvvv
		//this.storedUpdates = new Set();
		if (this.x%2 === 1 && this.y%2 === 1)
			this.ant = {pos: starting_pos, dir: [0, 1]};
		else
			this.ant = {pos: starting_pos, dir: [0, 1]};
			//throw new Error("Even-sized grid, cannot place Langston Ant in true center.");
	}

	step = ():void => {	
 			const [x, y] = this.ant.pos;
			const color = this.grid[x][y];

			//check color			
			if (color === 1)
			{	//paint black and turn right if white
				this.ant.dir = Langston.turnAnt(this.ant.dir, "right");
			} else if (color === 0)
			{	//paint white and turn left if black
				this.ant.dir = Langston.turnAnt(this.ant.dir, "left");
			}

			//invert square
			this.grid[x][y] = color === 1 ? 0 : 1;
			this.pushUpdate([x, y]);

			//step and wrap edges
			let [px, py] = [x + this.ant.dir[0], y + this.ant.dir[1]];
			if (px < 0) px += this.x;
			if (px >= this.x) px -= this.x;
			if (py < 0) py += this.y;
			if (py >= this.y) py -= this.y;
			this.ant.pos = [px, py];
	}
}

export class CustomAnt extends LangstonAnt{
	//langston's ant with different rules
	antDefinition: AntDefinition

	constructor(grid: number[][], starting_pos: number[], antConfig: string) {	
		console.log("CREATING NEW ANTIMUS");
		super(grid);

		this.antDefinition = CustomAnt.parseAntDefinition(antConfig);
		this.ant = {pos: starting_pos, dir: Langston.dtov(this.antDefinition.startDirection)};
	}
	
	static parseAntDefinition(obj: unknown): AntDefinition {
	  if (typeof obj !== "object" || obj === null || !("rules" in obj)) {
	    throw new Error("Invalid AntDefinition JSON");
	  }
	  return obj as AntDefinition;
	}

	//i dunno why this is here
	getUpdates = ():[number, number][] => {
		return [];
	}

	//override step to implement JSON-described behavior
	step = ():void => {
			const [x, y] = this.ant.pos;
			const definition: AntDefinition = this.antDefinition;
			const rule = definition.rules[this.grid[x][y]] ?? definition.defaultRule;

			var [px, py] = [0, 0];
			if (rule) {
				this.ant.dir = Langston.turnAnt(this.ant.dir, rule.turn);
				this.grid[x][y] = rule.flipTo;
				this.pushUpdate([x, y]);
			}
			const [dx, dy] = this.ant.dir;
			[px, py] = [x + dx, y + dy];
			
			
			
			if (px < 0) px += this.x;
			if (px >= this.x) px -= this.x;
			if (py < 0) py += this.y;
			if (py >= this.y) py -= this.y;
			this.ant.pos = [px, py];
	}
}
	
static class PlantEnvironment {
	resources: string[] = {
		"water", "light"
	};

	try_reproduction = (plant: Plant):[boolean, Record<string, number>, Record<string, number>] => {
		reproduction_cost = {"water" : 2, "light": 5};
		child_resources = {"water": 1, "light": 3};
		parent_resources = plant.resources; 
		for(int i =0;i<resources.length;i++) 
			key = resources[i]
			if (parent_resources[key] < reproduction_cost[key])
				return [false, null];
			else
				parent_resources[key] -= reproduction_cost[key];
		return [true, parent_resources, child_resources];
	};
}
		
type Plant = {
	pos: number[];
	dir: number[];
	//tracks stored water, sunlight, etc
	resources: Record<string,number>;
};
export class LangstonPlant extends Langston {
	plant: Plant;
	config: PlantDefinition;

	interface PlantDefinition {
	  defaultRule: Action;  //default to this rule if color not in rules
	  rules: Record<number, [Action, arg]>;       // rules for colors 
	}

	//actions make ant do something to grid
	type Action = (arg: string) => void; 

	//actions can then be used as keywords in the llm-generated config
	private actions: Record<string, Action> = {
		"move": (arg: string) => {this.plant.pos = {this.plant.pos[0] + this.plant.dir[0], this.plant.pos[1] + this.plant.dir[1]};},
		"turn": (arg: string) => {
			try {  this.plant.dir = super.dtov(arg);  } catch (e) {
			  if (e instanceof TypeError) {
			    this.plant.dir = super.turnAnt(this.plant.dir, arg);
  			  } else {
			    throw e; // don’t swallow unexpected errors
		}       } },
		"reproduce": (arg) => {
			results = try_reproduction(this.plant);
			if(results[0]) {
				//handle results[1,2], the resulting resources available to parent and child 
			}
		},
		"flipTo": (arg) => {
			//build out args to use flipTo for the LLM to inject logic which can look at resources, surounding squares, etc
			//the color it flips to will then decide next step's action
		},
	};


	constructor(grid: number[][], starting_pos: number[]) {
		super(grid);
		initResources: Record<string, number> = Object.fromEntries(PlantEnvironment.resources.map(k => [k, 1]));
		this.plant = {
			pos: starting_pos, dir: [0, -1], resources: initResources
		};
	}
	
	step = ():void => {
		rule = grid[this.plant.pos[0]][this.plant.pos[1]];
		action, arg = config.rules[rule];
		actions[action](arg);
	}

}