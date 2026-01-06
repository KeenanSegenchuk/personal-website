import LangstonGrid from "../Langton/LangstonGrid";
import Renderer from "../Langton/Renderer";
import StepController from "../Langton/Stepper";
import React, {useRef, useState} from 'react';

type GridPlayerProps = {
  type: string;
  title: string;
  width: number;
  height: number;
  gridDimensions: string;
};

function GridWrapper({type, title, width, height, gridDimensions}: GridPlayerProps) { 
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const grid = new LangstonGrid(type, gridDimensions, width, height, canvasRef);  

  return (
    <div style = {{margin: "35px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", border: "2px solid white"}}>
      <h2>{title}</h2>
      <ControllerWrapper controller={grid.controller}/>
      <Renderer width={width} height={height} render={grid.renderCanvas}/>
    </div>
  );
}

export default GridWrapper;

function ControllerWrapper({ controller }: { controller: StepController }) {
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);

  React.useEffect(() => {
    controller.subscribe(() => forceUpdate());
  }, [controller]);

  return <>{controller.render()}</>;
}