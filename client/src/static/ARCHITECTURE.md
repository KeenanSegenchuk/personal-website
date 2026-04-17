# static/ Architecture

## Directory layout

```
static/
  backgrounds/        Canvas-based full-area background components
    WaveBackground.tsx
    LeafBackground.tsx
    CloudLeafBackground.tsx
  elements/           Presentational UI components (no canvas)
    Bio.tsx
    PersonalExperience.tsx
  ExperiencePoints.js Static data arrays consumed by elements/
  ARCHITECTURE.md     This file
```

## Background component pattern

Every background component follows the same structural contract:

```tsx
<div style={{ position: "relative", overflow: "hidden" }}>   {/* root — sized by content */}
  <canvas style={{ position: "absolute", inset: 0, ... }} /> {/* fills root, drawn once */}
  <div style={{ position: "relative", zIndex: 1 }}>          {/* children float above canvas */}
    {children}
  </div>
</div>
```

- The root `div` has no explicit height; its height comes from `children`.
- The `canvas` is absolute so it doesn't affect layout.
- Canvas pixels are set once in a `useEffect` that lists all visual props as dependencies.
- Canvas dimensions are read from `canvas.offsetWidth/offsetHeight` (CSS-driven) so the
  component reacts correctly to fluid layouts.

## Seeded RNG

All backgrounds use the **Mulberry32** PRNG so that the same `seed` always produces the
same layout. This prevents re-randomising on re-render.

```ts
function mulberry32(seed: number): () => number
function randRange(min: number, max: number, rng: () => number): number
```

Both helpers are duplicated per file (no shared module) to keep each component self-contained.

**All background patterns must re-randomize on page refresh.** Seed props and any other
layout-variance props (e.g. `density`, `numClouds`) must be randomized per page load.
Use `useState` lazy initializers so the value is fixed for the component's lifetime but
fresh on every mount:

```tsx
const [waveSeed] = useState(() => Math.random() * 100);
```

Do not pass `Math.random()` inline in JSX — that re-evaluates on every re-render and
causes the background to flicker whenever unrelated state (e.g. a cooldown counter) changes.

## Compositing in CloudLeafBackground

`CloudLeafBackground` draws leaf-filled clouds without clipping paths, using an
**offscreen canvas + `source-atop` compositing**:

1. Cloud shape is drawn onto an offscreen canvas as a union of filled circles
   (overlapping `ctx.arc` + `ctx.fill` calls, one per bubble).
2. `globalCompositeOperation = "source-atop"` is set — subsequent drawing only
   affects pixels where the cloud was already drawn.
3. Leaves are drawn across the full offscreen bounding box; the composite operation
   clips them to the cloud silhouette automatically. Cloud colour shows through gaps
   between leaves.
4. The finished offscreen canvas is stamped onto the main canvas with `ctx.drawImage`.

This avoids the complexity of tracing a compound `ctx.clip()` path from overlapping circles.

## Adding a new background

1. Copy the root-div / canvas / children-div structure above.
2. Implement a `useEffect` that reads `canvas.offsetWidth/Height`, sets `canvas.width/height`,
   creates a `mulberry32(seed)` RNG, and draws.
3. List every prop that affects drawing in the `useEffect` dependency array.
4. Export a typed props interface; always include `seed?`, `className?`, `children?`.
