import { useEffect, useState, useRef } from "react";

export default function Renderer({ render, width, height }: { render: (ctx: CanvasRenderingContext2D | null) => void, width: number, height: number }) {
  //const [, setTick] = useState(0); // we just need a dummy state to trigger re-render
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animationFrameId: number;
    const loop = () => {
      //setTick((t) => t + 1); // force a React re-render
      const ctx = canvasRef?.current?.getContext("2d");
      if(ctx) {	
	render(ctx);
      }
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);



  return <canvas width={width} height={height} ref={canvasRef}>{/*render()*/}</canvas>;
}