import React, {useState} from "react";
import GridWrapperGrid from "./GridWrapperGrid";
import WaveBackground from "../../static/backgrounds/WaveBackground";
import CloudLeafBackground from "../../static/backgrounds/CloudLeafBackground";

const LangtonsPage: React.FC = () => {
  // Computed once on mount so re-renders don't re-randomize the backgrounds
  const [waveDensity] = useState(() => Math.random() * 60);
  const [waveSeed] = useState(() => Math.random() * 40);
  const [cloudSeed] = useState(() => Math.random() * 1000);
  const [cloudNumClouds] = useState(() => Math.floor(Math.random() * 6) + 5);
  const [cloudLeafDensity] = useState(() => Math.random() * 1.5 + 0.5);

  return (
    <div style={{ height: "100vh", overflow: "hidden", display: "flex", flexDirection: "column", position: "relative" }}>
      {/* Decorative background — fixed behind content */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden" }}>
        <WaveBackground
          backgroundColor="transparent"
          waveColors={["#0b3d4a", "#0f4c5c", "#1a5c6d"]}
          lineColors={["#0b3d4a", "#222222", "#0f4c5c", "#707000", "#1a4c6d", "#334400"]}
          density={waveDensity}
          seed={waveSeed}
          className="full-height-bg"
        >
          <CloudLeafBackground
            numClouds={cloudNumClouds}
            cloudColor="rgba(230, 245, 255, 0.82)"
            leafColors={["#4a7c59", "#6aaa7a", "#2d5a3d", "#8fbc8f", "#3a6b4a"]}
            leafDensity={cloudLeafDensity}
            seed={cloudSeed}
            className="full-height-bg"
          />
        </WaveBackground>
      </div>

      <header className="langton-header" style={{ position: "relative", zIndex: 1, flexShrink: 0 }}>
        <h1>Langton's Page</h1>
        <span className="langton-subtitle">Custom Langton's Ant Simulator</span>
      </header>

      <div style={{ flex: 1, overflow: "auto", minHeight: 0, position: "relative", zIndex: 1 }}>
        <GridWrapperGrid
          width={1000}
          height={500}
          gridDimensions="101x101"
        />
      </div>
    </div>
  );
};

export default LangtonsPage;
