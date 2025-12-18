import * as React from "react";

export default class StepController {
	//StepController takes a nullary function and provides a UI to control iteration

	step: () => void;
	stepSpeed: number = 5; //step frequency in hz
	stepNum: number = 0; //step count
	stepIncrement: number = 5; //value to increment by when using +/- buttons
  	
	toggle: boolean = false;
	lastTime: number = 0;
	accumulator: number  = 0;

	constructor(step: () => void, defaultSpeed: number) {
		this.step = step;
		this.stepSpeed = defaultSpeed;
	}
	
	//loop through step at stepSpeed hz
	loop = (time: number):void => {
		if (!this.toggle) return;

		//const time = performance.now();
		const delta = (time - this.lastTime) / 1000;
		this.lastTime = time;
		this.accumulator += delta;
		const stepInterval = 1/ this.stepSpeed;

		while (this.accumulator >= stepInterval) {
			this.step();
			this.stepNum++;
			this.accumulator -= stepInterval;
		}

		requestAnimationFrame(this.loop);
	}

	onToggle = ():void => {
		//stops update loop if playing, else starts loop
		if(this.toggle) {
			this.toggle = false;
		} else {
			this.toggle = true;
			this.lastTime = performance.now();
			requestAnimationFrame(this.loop);
		}
	}

	onIncrement = (buttonText: string):void => {
		if (buttonText === "+") {
			this.stepSpeed += this.stepIncrement;
		} else if (buttonText === "-") {
			this.stepSpeed -= this.stepIncrement;
		}
	}
	
	setStepSpeed = (speed: number):void => {
		this.stepSpeed = speed;
	}
	setIncrement = (increment: number):void => {
		this.stepIncrement = increment;
	}

	//make control bar. Should have a pause/play button and +/- buttons to increase speed. 
	//Also show stepSpeed labeled hz and an input field to set the increment for the +/- buttons
	render = ():React.JSX.Element => {
		const spacing = {width:"5px"};
		return (
			<div style = {{backgroundColor: "#BBCCFF", display: "flex", flexDirection: "row"}}>
				{/*from left to right: play/pause button works by calling onToggle, make -/+ buttons sandwich stepSpeed display, and give the option to set increment in this div*/}
				<button onClick = {this.onToggle}>{this.toggle ? "PAUSE" : "PLAY"}</button><div style={spacing}/>
				<button onClick = {() => this.onIncrement("-")}>-</button><div style={spacing}/>
				<label>Speed: <input type="number" onChange={(e) => this.setStepSpeed(Number(e.target.value))} value = {this.stepSpeed}></input></label><div style={spacing}/>
				<button onClick = {() => this.onIncrement("+")}>+</button><div style={spacing}/>
				<label>+/- Increment: <input type="number" onChange={(e) => this.setIncrement(Number(e.target.value))} value = {this.stepIncrement}></input></label>
			</div>
		);
	}
}