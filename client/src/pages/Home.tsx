import React, { useState } from "react";
import Header from "../components/Header";
import LeafBackground from "../static/backgrounds/LeafBackground";
import PersonalExperience from "../static/elements/PersonalExperience";
import Bio from "../static/elements/Bio";

const backgroundColor = "#009E60";
const tabsObj = {
			tabs: [ {
				title: "Experience",
				key: "Experience",
				color: "Yellow",
				},{
				title: "Gaming",
				key: "Gaming",
				color: "Red",
				},{
				title: "Outdoor Hobbies",
				key:"Outdoors",
				color: "Green",
				},{
				title: "Project Directory",
				key: "Dir",
				color: "Gray",
				}
			      ]
		}

const HomePage: React.FC = () => {
  const [tab, setTab] = useState("Experience");
  const tabSelectorProps = {...tabsObj, "setKey":setTab};
  return (
    <div style = {{background: backgroundColor}}>
      <Header tabProps = {tabSelectorProps}/>

      {tab === "Experience" &&
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
      }
      {tab === "Gaming" &&
	/*do stuff like link to my montages here*/
	<div id = "gamingTab">
	</div>
      }
      {tab === "Outdoors" &&
	/*share fishing and mtb pics*/
	<div id = "outdoorsTab">
	</div>
      }
      {tab === "ProjectDirectory" &&
	<div id = "projectDirectoryTab">
	</div>
      }
    </div>
  );
};

export default HomePage;