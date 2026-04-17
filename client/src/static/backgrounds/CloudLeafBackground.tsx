import React, { useEffect, useRef } from "react";

type CloudLeafBackgroundProps = {
  numClouds?: number;
  cloudColor?: string;   // fill colour of each cloud (supports rgba)
  leafColors: string[];
  leafDensity?: number;  // higher = more leaves per cloud
  seed?: number;
  className?: string;
  contentStyle?: React.CSSProperties;
  children?: React.ReactNode;
};

const CloudLeafBackground: React.FC<CloudLeafBackgroundProps> = ({
  numClouds = 6,
  cloudColor = "rgba(230, 245, 255, 0.82)",
  leafColors,
  leafDensity = 1,
  seed = 1,
  className,
  contentStyle,
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

      const rng = mulberry32(seed);
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < numClouds; i++) {
        const cx = randRange(0.08, 0.92, rng) * width;
        const cy = randRange(0.08, 0.92, rng) * height;
        const cw = randRange(130, 300, rng);
        const ch = randRange(70, 160, rng);
        drawCloudWithLeaves(ctx, cx, cy, cw, ch, cloudColor, leafColors, leafDensity, rng);
      }
    };

    draw();

    const ro = new ResizeObserver(draw);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [numClouds, cloudColor, leafColors, leafDensity, seed]);

  return (
    <div className={className} style={{ position: "relative" }}>
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative", zIndex: 1, ...contentStyle }}>{children}</div>
    </div>
  );
};

export default CloudLeafBackground;

// ---------- Cloud rendering ----------

/**
 * Draws a single cloud filled with leaves onto ctx at (cx, cy).
 *
 * Technique: offscreen canvas + source-atop compositing.
 *   1. Draw cloud shape (union of circles) in cloudColor on offscreen canvas.
 *   2. Set source-atop: subsequent drawing only lands on existing cloud pixels.
 *   3. Draw leaves over the whole bounding box — composite op clips them to cloud.
 *   4. Stamp offscreen canvas onto main canvas.
 *
 * Cloud colour shows through between leaves; no explicit clip path needed.
 */
function drawCloudWithLeaves(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  h: number,
  cloudColor: string,
  leafColors: string[],
  density: number,
  rng: () => number
) {
  const pad = 20; // extra margin so edge leaves aren't clipped
  const offW = Math.ceil(w + pad * 2);
  const offH = Math.ceil(h + pad * 2);

  const off = document.createElement("canvas");
  off.width = offW;
  off.height = offH;
  const oc = off.getContext("2d")!;

  const ocx = offW / 2;
  const ocy = offH / 2;

  // 1. Cloud shape: union of overlapping circles
  oc.fillStyle = cloudColor;
  cloudBubbles(w, h).forEach(({ dx, dy, r }) => {
    oc.beginPath();
    oc.arc(ocx + dx, ocy + dy, r, 0, Math.PI * 2);
    oc.fill();
  });

  // 2. Leaves inside cloud (source-atop clips to cloud pixels)
  oc.globalCompositeOperation = "source-atop";
  const spacing = 16 / density;
  const jitter = spacing * 0.45;
  for (let ly = ocy - offH / 2; ly < ocy + offH / 2; ly += spacing) {
    for (let lx = ocx - offW / 2; lx < ocx + offW / 2; lx += spacing) {
      if (rng() < 0.18) continue;
      const px = lx + randRange(-jitter, jitter, rng);
      const py = ly + randRange(-jitter, jitter, rng);
      const size = randRange(5, 12, rng);
      const rotation = randRange(0, Math.PI * 2, rng);
      const color = leafColors[Math.floor(rng() * leafColors.length)];
      drawLeaf(oc, px, py, size, rotation, color);
    }
  }

  // 3. Stamp onto main canvas
  ctx.drawImage(off, cx - offW / 2, cy - offH / 2);
}

/**
 * Returns relative positions and radii for the circles that make up a cloud.
 * Origin is the cloud centre; w/h is the bounding box.
 */
function cloudBubbles(
  w: number,
  h: number
): { dx: number; dy: number; r: number }[] {
  return [
    { dx:  0,         dy:  h * 0.12, r: h * 0.44 }, // main body
    { dx: -w * 0.22,  dy:  h * 0.16, r: h * 0.34 }, // left body
    { dx:  w * 0.22,  dy:  h * 0.16, r: h * 0.34 }, // right body
    { dx: -w * 0.11,  dy: -h * 0.16, r: h * 0.30 }, // top-left bump
    { dx:  w * 0.14,  dy: -h * 0.20, r: h * 0.27 }, // top-right bump
    { dx: -w * 0.34,  dy:  h * 0.20, r: h * 0.22 }, // far-left lobe
    { dx:  w * 0.34,  dy:  h * 0.20, r: h * 0.22 }, // far-right lobe
  ];
}

// ---------- Leaf drawing (same bezier as LeafBackground) ----------

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
