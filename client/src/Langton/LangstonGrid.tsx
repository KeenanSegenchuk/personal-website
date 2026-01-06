import React from "react";
import StepController from "./Stepper";
import axios, { AxiosResponse, AxiosError } from "axios";
import {Langston, LangstonAnt, LangstonPlant, CustomAnt} from "./Langston";

type Rect = {
	x: number	
	y: number
	width: number
	height: number
}	



export default class LangstonGrid{
	type: string;
	langston!: Langston;
	grid: number[][];
	canvasRef: React.RefObject<HTMLCanvasElement | null>;
	doneInit: boolean = false;
	colors: string[] = ["#000000", "#FF2244", "#AA00AA"];
	zoomView: Rect;

	controller!: StepController;
	

	constructor(type: string, dimensions: string, public width: number, public height: number, canvasRef: React.RefObject<HTMLCanvasElement | null>)
	{
		this.canvasRef = canvasRef;

		const [x, y] = dimensions.split(/[,x]/).map(Number);
		this.zoomView = {x: 0, y:0, width: width, height: height};
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
	
	//TODO
	//add zoom functionality here
	//listen to mouse pos when over canvas and zoom on mouse using scroll bar

	renderCanvas = (ctx: CanvasRenderingContext2D | null): void => {
	  if(!ctx) return;
	  if(!this.doneInit) this.drawBG(ctx);

	  const cellWidth = this.width / this.grid[0].length;
	  const cellHeight = this.height / this.grid.length;
	
	  //fetch intraframe updates
	  const storedUpdates = this.langston.getUpdates();
	  this.langston.clearUpdates();	

	  //only draw updated positions
	  storedUpdates.forEach((pos) => {
		const [y, x] = pos;
		ctx.fillStyle = this.colors[this.grid[x][y]];
		ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight); 
	  });
	}

	drawBG = (ctx: CanvasRenderingContext2D | null): void => {
	  if(!ctx) return;
	  ctx.fillStyle = "black";
	  ctx.fillRect(0,0,this.width,this.height);
	  
	  //init complete when canvas can be drawn on
	  this.doneInit = true;
	  console.log("LangstonGrid finished init");
	}

	drawGrid = (ctx: CanvasRenderingContext2D | null): void => {
		if(!ctx) return;
		this.drawBG(ctx); //draw background

		const cellWidth = this.width / this.grid[0].length;
		const cellHeight = this.height / this.grid.length;
		for(let a = 0; a < this.grid[0].length; a++)
			for(let b = 0; b < this.grid.length; b++) {
				ctx.fillStyle = this.colors[this.grid[a][b]];
				ctx.fillRect(a * cellWidth, b * cellHeight, cellWidth, cellHeight); 
			}
	}



	//canvas rendering functions for zoom functionality

	renderUpdatesZoomed = (ctx: CanvasRenderingContext2D | null): void => {
	  if(!ctx) return;
	  if(!this.doneInit) this.drawBG(ctx);

	  const cellWidth = this.width / this.grid[0].length;
	  const cellHeight = this.height / this.grid.length;
	
	  //fetch intraframe updates
	  const storedUpdates = this.langston.getUpdates();
	  this.langston.clearUpdates();	

	  //only draw updated positions
	  storedUpdates.forEach((pos) => {
		const [b, a] = pos;
		const {x, y, width, height} = this.zoomRect({x: a * cellWidth, y: b * cellHeight, width: cellWidth, height: cellHeight});
		ctx.fillStyle = this.colors[this.grid[a][b]];
		ctx.fillRect(x, y, width, height ); 
	  });
	}

	drawGridZoomed = (ctx: CanvasRenderingContext2D | null): void => {
		if(!ctx) return;
		this.drawBG(ctx); //draw background

		const cellWidth = (this.zoomView.width/this.width) * this.width / this.grid[0].length;
		const cellHeight = (this.zoomView.height/this.height) * this.height / this.grid.length;

		for(let a = 0; a < this.grid[0].length; a++)
			for(let b = 0; b < this.grid.length; b++) {
				const {x, y, width, height} = this.zoomRect({x: a * cellWidth, y: b * cellHeight, width: cellWidth, height: cellHeight});
				ctx.fillStyle = this.colors[this.grid[a][b]];
				ctx.fillRect(x, y, width, height); 
			}
	}

	//transfroms Rect to where it is in zoom view
	private zoomRect = (r: Rect): Rect => {
		const {x, y, width, height} = this.zoomView;

		//this is the number of zoomed pixels that it takes to fill 1 pixel in unzoomed canvas.
		//i.e. a zoom scale of 2 means the zoomed canvas has 4x the resolution (scaleW * scaleH)
		const [scaleW, scaleH] = [this.width/width, this.height/height]; 

		const res = {
			x:(x-r.x)* scaleW,
			y:(y-r.y)* scaleH,
			width: r.width*scaleW, 
			height: r.height*scaleH
		};
		return res;	
	}
	
}



