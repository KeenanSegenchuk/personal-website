import React, { useState } from "react";
import Header from "../components/Header";
import LeafBackground from "../static/backgrounds/LeafBackground";
import PersonalExperience from "../static/elements/PersonalExperience";
import Bio from "../static/elements/Bio";
import GamingTab from "./Homepage Tabs/GamingTab";
import OutdoorsTab from "./Homepage Tabs/OutdoorsTab";
import ProjectDirectory from "./Homepage Tabs/ProjectDirectory";
import {useAppContext} from "../AppContext";
import { Link } from "react-router-dom";

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
				title: "Outdoors",
				key: "Outdoors",
				color: "Green",
				},{
				title: "ProjectDirectory",
				key: "ProjectDirectory",
				color: "Grey",
				}
			      ]
		}

const HomePage: React.FC = () => {
  const {options} = useAppContext();
  const [tab, setTab] = useState("Experience");
  const tabSelectorProps = {...tabsObj, "setKey":setTab, "selected":tab};
  return (
    <div style = {{background: backgroundColor}}>
      <Header tabProps = {tabSelectorProps}/>

      {tab === "Experience" &&
        <main style={{ padding: "0rem", }}>
	  <LeafBackground
	    backgroundColor={backgroundColor}
	    leafColors={["#34AA16", "#12A53e", "#2aBe50"]}
	    seed={Math.random()*100}
	    density={1}
	    className="min-h-screen p-16"
	  >
	    <div style={{padding: "0 1.7%"}}>
		<Bio setState={setTab}/>
		<PersonalExperience/></div> 
	  </LeafBackground>
        </main>
      }
      {tab === "Gaming" &&
	/*do stuff like link to my montages here*/
	<GamingTab/>
      }
      {tab === "Outdoors" &&
	/*share fishing and mtb pics*/
	<OutdoorsTab/>
      }
      {tab === "ProjectDirectory" &&
	<ProjectDirectory/>
      }
    </div>
  );
};

export default HomePage;