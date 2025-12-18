import React from "react";
import '../App.css';

type ExpProps = {
  date: string;
  role: string;
  description: string[];
}

const ExperiencePoint: React.FC<ExpProps> = ({date, role, description}) => {
	return (
		<div>
			<div className="flexRow" style={{justifyContent: 'space-between'}}>
				<h2>{role}</h2>
				<h2>{date}</h2>
			</div>
			<div className="flexCol">
				{description.map((e, i) => (<p key={i}>{e}</p>))}
			</div>
		</div>
	);
};

export default ExperiencePoint;