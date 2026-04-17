import { useEffect, useState, useRef } from "react";

export default function Renderer({ render, width, height }: { render: (ctx: CanvasRenderingContext2D | null) => void, width: number, height: number }) {
  //const [, setTick] = useState(0); // we just need a dummy state to trigger re-render
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animationFrameId: number;
    let active = true;

    const loop = () => {
      if (!active) return;
      
      const ctx = canvasRef?.current?.getContext("2d");
      if(ctx) {	
	console.log("Rendering Canvas...");
	render(ctx); 
      }
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => {
	active = false;
	cancelAnimationFrame(animationFrameId);
    };
  }, []);



  return <canvas width={width} height={height} ref={canvasRef}>{/*render()*/}</canvas>;
}