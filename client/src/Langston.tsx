import * as fs from "fs";

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
	grid: number[][];
	storedUpdates: [number, number][] = [];	
	abstract step():void;

	constructor(grid: number[][]) {
		this.grid = grid;
		this.initUpdates();
	}
	getUpdates = (): [number, number][] => {
		return this.storedUpdates;
	}
	initUpdates():void {
		this.grid.forEach((row, i) => {
			row.forEach((cell, j) => {
				this.storedUpdates.push([i, j]);
			});
		});
	}
}

export class CustomAnt extends Langston{
	//langston's ant with different rules
	ants: Ant[]
	antDefinitions: AntDefinition[]
	
	x: number
	y: number

	constructor(grid: number[][], antConfig: string) {	
		super(grid);
		[this.x, this.y] = [grid.length, grid[0]!.length];
		this.antDefinitions = [];
		this.antDefinitions.push(CustomAnt.parseAntDefinition(antConfig));
		
		this.ants = [];
		const init_pos: tuple = [Math.floor(this.x/2), Math.floor(this.y/2)];
		const init_dir = {"N":[1,0] as tuple, "E":[0,1] as tuple, "S":[-1,0] as tuple, "W":[0,-1] as tuple};
		this.antDefinitions.forEach((definition) => {
			this.ants.push({pos: init_pos, dir: init_dir[definition.startDirection]});
		});
	}
	
	static parseAntDefinition(json: string): AntDefinition {
	  const obj = JSON.parse(json);
	  if (typeof obj !== "object" || !obj.rules) {
	    throw new Error("Invalid AntDefinition JSON");
	  }
	  return obj as AntDefinition;
	}

	private turnAnt = (dir: number[], turnDir: TurnDirection): tuple => {
		if (turnDir === "left") {
			return [-dir[1], dir[0]];
		} else if (turnDir === "right") {
			return [dir[1], -dir[0]];
		} else if (turnDir === "reverse") {
			return [-dir[0], -dir[1]];
		}
		return [0, 0];
	}

	getUpdates = ():[number, number][] => {
		return [];
	}

	//override step to implement JSON-described behavior
	step = ():void => {
		this.ants.forEach((ant, index) => {
			const [x, y] = ant.pos;
			const definition: AntDefinition = this.antDefinitions[index];
			const rule = definition.rules[this.grid[x][y]] ?? definition.defaultRule;

			var [px, py] = [0, 0];
			if (rule) {
				ant.dir = this.turnAnt(ant.dir, rule.turn);
				this.grid[x][y] = rule.flipTo;
			} 
			const [dx, dy] = ant.dir;
			[px, py] = [x + dx, y + dy];
			
			
			
			if (px < 0) px += this.x;
			if (px >= this.x) px -= this.x;
			if (py < 0) py += this.y;
			if (py >= this.y) py -= this.y;
			ant.pos = [px, py];
		});
	}
}

export class LangstonAnt extends Langston {
	ants: Ant[]
	x: number
	y: number



	constructor(grid: number[][]) 
	{
		super(grid);
		[this.x, this.y] = [grid.length, grid[0]!.length];
		this.ants = [];
		this.storedUpdates = [];
		if (this.x%2 === 1 && this.y%2 === 1)
			this.ants.push({pos: [Math.floor(this.x/2), Math.floor(this.y/2)], dir: [0, 1]});
		else
			this.ants.push({pos: [Math.floor(this.x/2), Math.floor(this.y/2)], dir: [0, 1]});
			//throw new Error("Even-sized grid, cannot place Langston Ant in true center.");
	}
	
	getUpdates = ():[number, number][] => {
		return this.storedUpdates;
	}

	step = ():void => {
		this.ants.forEach((ant) => {	
 			const [x, y] = ant.pos;
			const color = this.grid[x][y];

			//check color			
			if (color === 1)
			{	//paint black and turn right if white
				ant.dir = [ant.dir[1],-ant.dir[0]];
			} else if (color === 0)
			{	//paint white and turn left if black
				ant.dir = [0-ant.dir[1],ant.dir[0]];
			}

			//invert square
			this.grid[x][y] = color === 1 ? 0 : 1;
			this.storedUpdates.push([x, y]);

			//step and wrap edges
			let [px, py] = [x + ant.dir[0], y + ant.dir[1]];
			if (px < 0) px += this.x;
			if (px >= this.x) px -= this.x;
			if (py < 0) py += this.y;
			if (py >= this.y) py -= this.y;
			ant.pos = [px, py];
		});
	}
}

export class LangstonPlant extends Langston {
	constructor(grid: number[][]) {
		super(grid);
	}
	step = ():void => {
	
	}
}