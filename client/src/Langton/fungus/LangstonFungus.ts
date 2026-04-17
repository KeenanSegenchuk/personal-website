import { Langston } from "../Langston";
//import decode from "./Decoder/Decoder";

type ResourceBundle = {
  sun: number;
  water: number;
  energy: number;
}

type Interaction = {
  //send resources from to 
  from: string;
  to: string;
  resources: ResourceBundle;
  mode: string;
}

export class Cell {
	interactionQueue: Map<string, Interaction[]>;
	position: string;
	resources: ResourceBundle;
	step: ()=>void;
	constructor(pos: string, resources: ResourceBundle, genome: string, queue: Map<string, Interaction[]>) {
		this.position = pos;
		this.resources = resources;
		this.step = ()=>{}; //decode(genome, this);
		this.interactionQueue = new Map<string, Interaction[]>();
	}
	sendResource = (resources: ResourceBundle, to: string, mode: string):void => {
		const prev = this.interactionQueue.get(to) || [];
		const newInteraction: Interaction = { from: this.position, to, resources: {...resources}, mode };
		this.interactionQueue.set(to, [...prev, newInteraction]);
	};
}


/*
export class LangstonFungus 

export abstract class PositionQueue extends Langston{
	interactionQueue: Map<string, Interaction> = new Map<string, Interaction[]>();
	stepQueue: Map<sring, Cell> = new Map<string, LangstonFungus>();
	constructor(grid: number[][]):
}
*/