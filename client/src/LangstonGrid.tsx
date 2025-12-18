import React from "react";
import StepController from "./Stepper";
import axios, { AxiosResponse, AxiosError } from "axios";
import {Langston, LangstonAnt, LangstonPlant, CustomAnt} from "./Langston";




export default class LangstonGrid{
	type: string;
	langston!: Langston;
	grid: number[][];
	canvasRef: React.RefObject<HTMLCanvasElement | null>;
	colors: string[] = ["#000000", "#FF2244", "#AA00AA"];

	controller!: StepController;
	

	constructor(type: string, dimensions: string, public width: number, public height: number, canvasRef: React.RefObject<HTMLCanvasElement | null>)
	{
		this.canvasRef = canvasRef;

		const [x, y] = dimensions.split(/[,x]/).map(Number);
		this.grid = new Array(x).fill(0).map(() => new Array(y).fill(0));

		this.type = type;
		if (type === "Ant" || type === "ant")
			this.langston = new LangstonAnt(this.grid);
		else if (type === "Plant" || type === "plant")
			this.langston = new LangstonPlant(this.grid);
		else if (type === "Random" || type === "random")
		{	//Prompt chatGPT for random config
			const n_colors = this.colors.length;
			axios.get<string>(`http://localhost:5000/api/langton/ant_config/${n_colors}`)
			  .then((res: AxiosResponse<string>) => {
			    console.log("Received custom ant config:", res.data);
			    this.langston = new CustomAnt(this.grid, res.data);
			    this.controller = new StepController(this.langston.step, 5);
			  }).catch((err: AxiosError) => {
			    console.error("Error fetching config:", err);
			    //backup so it doesn't crash if server fails
			    this.langston = new LangstonAnt(this.grid);
			    this.controller = new StepController(this.langston.step, 5);
			  });
			return;
		}
		else 
		{
			this.langston = new LangstonAnt(this.grid);
			throw new Error(`Unknown type: ${type}, defaulting to Langton Ant`);
		}

		this.controller = new StepController(this.langston.step, 5);
	}		
		
	renderCanvas = (ctx: CanvasRenderingContext2D | null): void => {
	  if(!ctx) return;
	  const cellWidth = this.width / this.grid[0].length;
	  const cellHeight = this.height / this.grid.length;
	
	  const storedUpdates = this.langston.getUpdates();

	  //only draw updated positions
	  storedUpdates.forEach((pos) => {
		const [x, y] = pos;
		ctx.fillStyle = this.colors[this.grid[x][y]];
		ctx.fillRect(y * cellWidth, x * cellHeight, cellWidth, cellHeight); 

	  });
	  /*
	  this.grid.forEach((row, i) => {
	    row.forEach((cell, j) => {
	      ctx.fillStyle = this.colors[cell];
	      ctx.fillRect(j * cellWidth, i * cellHeight, cellWidth, cellHeight);
	    });
	  });
	  */
	  
	}

	render = (): React.JSX.Element => {
		const canvas = this.canvasRef.current;
		if (!canvas) return <><canvas width={this.width} height={this.height} ref={this.canvasRef}/></>;
		const ctx = canvas.getContext("2d");

		if (!canvas || !this.controller) {
		    // Canvas or controller not ready yet
		    return <div>Loading...</div>; // or <></> if you prefer
		}

		this.renderCanvas(ctx);
		return (
			<div>
				{this.controller.render()}
				<canvas width={this.width} height={this.height} ref={this.canvasRef}/>
			</div>
		);
	}
}



