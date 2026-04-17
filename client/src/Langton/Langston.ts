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

	constructor(grid: number[][]) {
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

export class CustomAnt extends Langston{
	//langston's ant with different rules
	ant: Ant
	antDefinition: AntDefinition
	
	x: number
	y: number

	constructor(grid: number[][], antConfig: string) {	
		console.log("CREATING NEW ANTIMUS");
		super(grid);
		[this.x, this.y] = [grid.length, grid[0]!.length];
		this.antDefinition = CustomAnt.parseAntDefinition(antConfig);
		
		const init_pos: tuple = [Math.floor(this.x/2), Math.floor(this.y/2)];
		this.ant = {pos: init_pos, dir: Langston.dtov(this.antDefinition.startDirection)};
	}
	
	static parseAntDefinition(obj: unknown): AntDefinition {
	  if (typeof obj !== "object" || obj === null || !("rules" in obj)) {
	    throw new Error("Invalid AntDefinition JSON");
	  }
	  return obj as AntDefinition;
	}

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

export class LangstonAnt extends Langston {
	ant: Ant
	x: number
	y: number



	constructor(grid: number[][]) 
	{
		super(grid);
		[this.x, this.y] = [grid.length, grid[0]!.length];
		this.storedUpdates = new Set();
		if (this.x%2 === 1 && this.y%2 === 1)
			this.ant = {pos: [Math.floor(this.x/2), Math.floor(this.y/2)], dir: [0, 1]};
		else
			this.ant = {pos: [Math.floor(this.x/2), Math.floor(this.y/2)], dir: [0, 1]};
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

export class LangstonPlant extends Langston {
	constructor(grid: number[][]) {
		super(grid);
	}
	step = ():void => {
	
	}
}