import React, { useEffect, useRef } from "react";

type LeafBackgroundProps = {
  backgroundColor: string;
  leafColors: string[];
  seed?: number;
  density?: number; // higher = more leaves
  className?: string;
  children?: React.ReactNode;
};

const LeafBackground: React.FC<LeafBackgroundProps> = ({
  backgroundColor,
  leafColors,
  seed = 1,
  density = 1,
  className,
  children,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;

    canvas.width = width;
    canvas.height = height;

    // ---------- Seeded RNG ----------
    const rng = mulberry32(seed);

    // ---------- Background ----------
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // ---------- Leaf placement ----------
    const spacing = 80 / density;
    const jitter = spacing * 0.4;

    for (let y = spacing / 2; y < height; y += spacing) {
      for (let x = spacing / 2; x < width; x += spacing) {
        if (rng() < 0.15) continue;

        const px = x + randRange(-jitter, jitter, rng);
        const py = y + randRange(-jitter, jitter, rng);

        const size = randRange(14, 28, rng);
        const rotation = randRange(0, Math.PI * 2, rng);
        const color = leafColors[Math.floor(rng() * leafColors.length)];

        drawLeaf(ctx, px, py, size, rotation, color);
      }
    }
  }, [backgroundColor, leafColors, seed, density]);

  return (
    <div
      className={className}
      style={{ position: "relative", overflow: "hidden" }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
};
export default LeafBackground;


// ---------- Leaf drawing ----------
function drawLeaf(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  rotation: number,
  color: string
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.scale(size, size);

  ctx.beginPath();
  ctx.moveTo(0, -1);
  ctx.bezierCurveTo(0.8, -0.8, 1, 0.2, 0, 1.2);
  ctx.bezierCurveTo(-1, 0.2, -0.8, -0.8, 0, -1);
  ctx.closePath();

  ctx.fillStyle = color;
  ctx.fill();

  ctx.restore();
}

// ---------- Utils ----------
function randRange(min: number, max: number, rng: () => number) {
  return min + (max - min) * rng();
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}