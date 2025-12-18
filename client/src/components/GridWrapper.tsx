import LangstonGrid from "../LangstonGrid";
import Renderer from "../Renderer";
import React, {useRef} from 'react';

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
      <Renderer render={grid.render}/>
    </div>
  );
}

export default GridWrapper;