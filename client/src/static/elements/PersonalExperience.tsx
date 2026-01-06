import { experience, projects } from "../ExperiencePoints.js";
import ExperiencePoint from "../../components/ExperiencePoint";


const epbgColor = "#eedd66";

const PersonalExperience: React.FC = () => { 
  return (
    <div>
	{/*-----     PROJECTS     -----*/}
          <h1 style={{ margin: "0 0"}}>Projects</h1>
          <div>
		{projects.map((e, i) => (
			<ExperiencePoint
				key={i}
				date={e.date}
				role={e.role}
				description={e.description}
				link={e?.link}
				color={epbgColor}
			/>
		))}
	  </div>

	{/*-----     EXPERIENCE     -----*/}
          <h1 style={{ margin: "0 0"}}>Experience</h1>
          <div>
		{experience.map((e, i) => (
			<ExperiencePoint
				key={i}
				date={e.date}
				role={e.role}
				description={e.description}
				link={e?.link}
				color={epbgColor}
			/>
		))}
	  </div>

	{/*-----     ACADEMICS     -----*/}
          <h1 style={{ margin: "0 0"}}>Academics</h1>
          <p style={{fontSize: "1.5em"}}>
            I received my B.S. from WPI in 2024, where I studied Computer Science with a focus on machine learning, software design, and mathematical modeling. 
            <br/>
	    I'm also a proud graduate of Nipmuc Regional Highschool, and I currently substitute teach there.
	  </p>
	  <div>
		TODO: Add course history here.
	  </div>
    </div>
  );
};

export default PersonalExperience;