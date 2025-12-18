import React from "react";
import GridWrapper from "../components/GridWrapper";

const LangtonsPage: React.FC = () => {
  return (
    <>
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
    </>
  );
};

export default LangtonsPage;