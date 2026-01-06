import React from "react";
import GridWrapper from "../components/GridWrapper";
import WaveBackground from "../static/backgrounds/WaveBackground";

const LangtonsPage: React.FC = () => {
  return (
    <WaveBackground
      backgroundColor="transparent"   
      waveColors={["#0b3d4a", "#0f4c5c", "#1a5c6d"]} 
      lineColors={["#0b3d4a", "#222222", "#0f4c5c", "#707000", "#1a4c6d", "#334400"]}
      density={Math.random()*60}                                 // more waves vertically
      seed={Math.random()*40}                                  // for consistent pattern
      className="my-wave-background"
    >
      <header className="App-header">
        My Website
      </header>

      <GridWrapper
        type="ant"
        title="Langton's Ant"
        width={1000}
        height={500}
        gridDimensions="1001x1001"
      />
    </WaveBackground>
  );
};

export default LangtonsPage;