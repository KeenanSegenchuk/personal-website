import React from "react";
import StepController from "./controllers/StepController";
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
	colors: string[] = ["#000000", "#FF2244", "#AA00AA", "#7FFF00", "#0000FF", "#8A2BE2", "#D2691E", "#00FFFF", "#006400", "#8B008B", "#DB7093"];
	zoomView: Rect;

	controller!: StepController;
	

	constructor(type: string, dimensions: string, public width: number, public height: number, canvasRef: React.RefObject<HTMLCanvasElement | null>, onReady?: (ctrl: StepController) => void, config?: string)
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
		else if (type === "Random" || type === "random" || type === "custom")
			this.langston = new CustomAnt(this.grid, config ?? "");
		else
		{
			this.langston = new LangstonAnt(this.grid);
			throw new Error(`Unknown type: ${type}, defaulting to Langton Ant`);
		}

		this.controller = new StepController(this.langston.step, 5);
		onReady?.(this.controller);
	}	
	
	//TODO
	//add zoom functionality here
	//listen to mouse pos when over canvas and zoom on mouse using scroll bar

	renderCanvas = (ctx: CanvasRenderingContext2D | null): void => {
	  if(!ctx) return;
	  if(!this.doneInit) this.drawBG(ctx);

	  const cellWidth = this.width / this.grid.length;
	  const cellHeight = this.height / this.grid[0].length;
	
	  //fetch intraframe updates
	  const storedUpdates = this.langston.consumeUpdates();
	  if(storedUpdates.length !== 0) console.log("Number of retrieved updates:", storedUpdates.length);

	  //only draw updated positions
	  storedUpdates.forEach((pos) => {
		const [x, y] = pos;

		//console.log(`Flipping color for square ${x}, ${y}`);
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

		const cellWidth = this.width / this.grid.length;
		const cellHeight = this.height / this.grid[0].length;
		for(let x = 0; x < this.grid.length; x++)
			for(let y = 0; y < this.grid[0].length; y++) {
				ctx.fillStyle = this.colors[this.grid[x][y]];
				ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
			}
	}



	//canvas rendering functions for zoom functionality

	renderUpdatesZoomed = (ctx: CanvasRenderingContext2D | null): void => {
	  //render updates on zoomed grid window
	  if(!ctx) return;
	  if(!this.doneInit) this.drawBG(ctx);

	  const cellWidth = this.width / this.grid.length;
	  const cellHeight = this.height / this.grid[0].length;

	  //fetch intraframe updates
	  const storedUpdates = this.langston.consumeUpdates();

	  //only draw updated positions
	  storedUpdates.forEach((pos) => {
		const [x, y] = pos;
		const {x: rx, y: ry, width, height} = this.zoomRect({x: x * cellWidth, y: y * cellHeight, width: cellWidth, height: cellHeight});
		ctx.fillStyle = this.colors[this.grid[x][y]];
		ctx.fillRect(rx, ry, width, height);
	  });
	}

	drawGridZoomed = (ctx: CanvasRenderingContext2D | null): void => {
		//redraw grid after zooming
		if(!ctx) return;
		this.drawBG(ctx); //draw background

		const cellWidth = this.zoomView.width / this.grid.length;
		const cellHeight = this.zoomView.height / this.grid[0].length;

		for(let x = 0; x < this.grid.length; x++)
			for(let y = 0; y < this.grid[0].length; y++) {
				const {x: rx, y: ry, width, height} = this.zoomRect({x: x * cellWidth, y: y * cellHeight, width: cellWidth, height: cellHeight});
				ctx.fillStyle = this.colors[this.grid[x][y]];
				ctx.fillRect(rx, ry, width, height);
			}
	}

	//transfroms Rect to where it is in zoom view
	private zoomRect = (r: Rect): Rect => {
		//helper fn to convert rect in gridspace to rect in zoomspace
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



