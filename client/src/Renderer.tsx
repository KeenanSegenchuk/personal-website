import { useEffect, useState, useRef } from "react";

export default function Renderer({ render }: { render: () => React.JSX.Element }) {
  const [, setTick] = useState(0); // we just need a dummy state to trigger re-render

  useEffect(() => {
    let animationFrameId: number;
    const loop = () => {
      setTick((t) => t + 1); // force a React re-render
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);



  return <>{render()}</>;
}