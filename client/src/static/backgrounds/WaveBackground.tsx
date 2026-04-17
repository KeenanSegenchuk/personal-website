import React, { useEffect, useRef } from "react";

type WaveBackgroundProps = {
  backgroundColor: string;
  waveColors: string[];
  lineColors: string[];
  seed?: number;
  density?: number; // higher = more waves
  className?: string;
  children?: React.ReactNode;
};

const WaveBackground: React.FC<WaveBackgroundProps> = ({
  backgroundColor,
  waveColors,
  lineColors,
  seed = 1,
  density = 1,
  className,
  children,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = () => {
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

      // ---------- Wave placement ----------
      const spacing = 100 / density; // vertical spacing between waves
      const jitter = spacing * 0.5;

      for (let y = spacing / 2; y < height; y += spacing) {
        if (rng() < 0.1) continue; // randomly skip some waves

        const py = y + randRange(-jitter, jitter, rng);
        const amplitude = randRange(10, 40, rng); // wave height
        const wavelength = randRange(80, 200, rng); // wave width
        const rand = rng();
        const color = waveColors[Math.floor(rand * waveColors.length)];
        const lineColor = lineColors[Math.floor(rand * lineColors.length)];

        drawWave(ctx, width, py, amplitude, wavelength, color);
        drawWaveLine(ctx, width, py, amplitude, wavelength, lineColor);
      }
    };

    draw();

    const ro = new ResizeObserver(draw);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [backgroundColor, waveColors, lineColors, seed, density]);

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

export default WaveBackground;

// ---------- Draw a simple sine wave ----------
function drawWave(
  ctx: CanvasRenderingContext2D,
  width: number,
  y: number,
  amplitude: number,
  wavelength: number,
  color: string
) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, y);

  const step = 5; // pixels per step
  for (let x = 0; x <= width; x += step) {
    const angle = (x / wavelength) * 2 * Math.PI;
    const py = y + Math.sin(angle) * amplitude;
    ctx.lineTo(x, py);
  }

  ctx.lineTo(width, y + amplitude * 2); // close bottom
  ctx.lineTo(0, y + amplitude * 2);
  ctx.closePath();

  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

 // ---------- Draw the top line of a sine wave ----------
function drawWaveLine(
  ctx: CanvasRenderingContext2D,
  width: number,
  y: number,
  amplitude: number,
  wavelength: number,
  lineColor: string,
) {
  ctx.save();
  ctx.beginPath();

  const step = 5; // pixels per step

  for (let x = 0; x <= width; x += step) {
    const angle = (x / wavelength) * 2 * Math.PI;
    const py = y + Math.sin(angle) * amplitude;

    if (x === 0) ctx.moveTo(x, py);
    else ctx.lineTo(x, py);
  }

  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 2;
  ctx.stroke();

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
