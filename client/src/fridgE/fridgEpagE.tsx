import React from "react";

// The URL of the static GitHub Pages page
const staticPageURL: string = "https://keenansegenchuk.github.io/HCIproject";

const fridgEpagE: React.FC = () => {
  return (
    <div style={{ width: "100%", height: "100vh", overflow: "hidden" }}>
      <iframe
        src={staticPageURL}
        style={{ width: "100%", height: "100%", border: "none" }}
        title="Static GitHub Page"
      />
    </div>
  );
};

export default fridgEpagE;