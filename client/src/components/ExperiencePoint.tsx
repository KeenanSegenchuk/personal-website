import React from "react";
import '../App.css';

type ExpProps = {
  date?: string;
  role?: string;
  description?: React.ReactNode[];
  color?: string;
  link?: string;
  premadeJSX?: React.ReactElement;
}

const ExperiencePoint: React.FC<ExpProps> = ({date, role, description = [], color, link, premadeJSX}) => {
	if (premadeJSX) {
		return premadeJSX;	
	}

	return (
		<div className="experiencePoint" style={{ ["--hover-bg" as any]: color }}>
			<a href={link ?? undefined} className="flexRow" style={{justifyContent: 'space-between'}}>
				<h2>{role}</h2>
				<h2>{date}</h2>
			</a>
			<div className="flexCol description">
				{description.map((e, i) => (<p key={i}>{e}</p>))}
			</div>
		</div>
	);
};

export default ExperiencePoint;