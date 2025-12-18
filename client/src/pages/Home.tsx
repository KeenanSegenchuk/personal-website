import React from "react";
import Header from "../components/Header";
import LeafBackground from "../components/LeafBackground";
import PersonalExperience from "../static/elements/PersonalExperience";
import Bio from "../static/elements/Bio";

const backgroundColor = "#009E60";

const HomePage: React.FC = () => {
  return (
    <div style = {{background: backgroundColor}}>
      <Header/>

      <main style={{ padding: "1rem", }}>
	<LeafBackground
	  backgroundColor={backgroundColor}
	  leafColors={["#34AA16", "#12A53e", "#2aBe50"]}
	  seed={Math.random()*100}
	  density={1}
	  className="min-h-screen p-16"
	>
	  <Bio/>
	  <PersonalExperience/> 
	</LeafBackground>
      </main>
    </div>
  );
};

export default HomePage;