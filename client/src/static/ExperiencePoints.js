import React from "react";

type ExperiencePoint = {
  date: string;
  role: string;
  link: string;
  description: string[];
}
function makeExperiencePoint(
  date: string,
  role: string,
  description: string,
  link?: string,
): ExperiencePoint {
  return {date, role, description, link};
}



/*
====================
  EXPERIENCE
====================
*/

const truVideo: ExperiencePoint = {
	date: "Jun 21 - Aug 21",
	role: "TruVideo | Software Engineer Intern",
	description: [<>Built Kibana analytic dashboards enabling clients to visualize engagement metrics.</>,
		<>Boosted indexing speed by streaming data from DynamoDB and MySQL into AWS Elasticsearch.</>,
		<>Provided clients with secure access to data on TruVideo’s private AWS network by exposing the Kibana dashboards through an EC2 bastion host.</>,
	],
};

const IQP = makeExperiencePoint(
	"Sep 22 - Dec 22",
	"WPI | Interdisciplinary Qualifying Project | Market Research",
	[
		<>Worked with students from WPI and Hangzhou Dianzi University to conduct market research for Zuoan Mixiang, a Chinese plant-dyed clothing company looking to expand into North America.</>,
		<>Compared 20,000+ words from websites of similar North American companies with varying success levels to identify successful core values and marketing language.</>,
		<>Designed a survey to gauge consumer opinion on artisanal, sustainable, and plant-dyed clothing based our review of 40 papers worth of past research.</>,
		<>Published a report that identified a niche for Zuoan Mixiang in the NA market and provided evidence-based suggestions for both reaching and relating to North American consumers.</>,
	],
);

const MQP = makeExperiencePoint(
	"Aug 23 - Jun 24",
	"WPI PracticePoint | Major Qualifying Project | Voice Control System for Robotic Arm Exoskeleton",
	[
		<>Developed a voice-controlled assistive system enabling users with speech and arm impairments to operate a robotic exoskeleton.</>,
		<>Applied machine learning for speech command recognition, filtering non-user speech and contextual ambiguity.</>,
		<>Debugged model by identifying failure cases in validation data then tuning hyperparameters, diversifying noise in training data, and optimizing audio preprocessing to make the model respond correctly to those cases.</>,
		<>Automated extraction of specific words from large datasets (up to 60GB).</>,
		<>Conducted user interviews to identify usability constraints and inform safety-driven features.</>,
	],
);
	
const grandJury: ExperiencePoint = {
	date: "Jul 22 - Sep 22",
	role: "Worcester County Grand Jury | Foreman",
	description: 
	[
		<>Conducted voting, signed off on indictments, and reported out to the judge.</>,
		<>Facilitated discussion between jurors with varying life experience and opinions.</>,
		<>Paid attention to hours of testimony and kept track of case details in order to clarify discussion.</>,
	],
};

const kalonCross = makeExperiencePoint(
	"Jul 19 - Sep 19",
	"New England Devo p/b Cadence Wealth Management | Kalon Cross | Race Promoter",
	[
		<>Planned and promoted a USA Cycling sanctioned event with 230 racers.</>,
		<>Oversaw all aspects of the event: budgeting; communicating with venue and reg/scoring services; promoting the race and creating the scedule and course.</>,
	],
);

export const experience = [
	MQP,
	IQP,
	grandJury,
	truVideo,
	kalonCross,
];

/*
====================
  PERSONAL PROJECTS
====================
*/

const uptonAir: ExperiencePoint = {
	date: "May 24 - Current",
	link: "https://upton-air.com/dashboard",
	role: "Sustainable Upton | Full-Stack Engineer",
	description: 
	[
		<>Built and deployed an <a href="https://upton-air.com/dashboard"> air quality monitoring website</a> for the town of Upton.</>,
		<>Hosted town-wide data for over a year and built a dahboard to help locals vizualize the air quality patterns.</>,
		<>Containerized and deployed the system via Docker Compose on Linux and configured Cloudflare for DNS and traffic rules.</>,
		<>Added public alerts for bad air quality and private ones for system downtime.</>,
		<>Collaborated directly with concerned citizens to tailor site to their use cases.</>,
		<>Built LLM-based chatbot to help users navigate the site and ask questions about the data.</>,
	],
};

const fridgE = makeExperiencePoint(
	"Jan 24 - Mar 24 - Current",
	"Fridge/Pantry Management Webpage",
	[
		<>Created vanilla HTML, JS, and CSS client to inventory fridge ingredients for a class on human-computer interraction.</>,
		<>Planning to continue work on this and host a dynamic version of the webpage at personal-website.url/fridgE.</>,
	]
);

const passingDistanceExtractor = makeExperiencePoint(
	"Sep 24 - Current",
	"Personal Project | Computer-Vision-Based Passing Distance Measurement",
	[
		<>Applied pre-trained model and camera geometry library in MATLAB to detect cars and extract their passing distance from rear-facing GoPro footage.</>,
		<>Created an application for live parameter tuning. The app vizualized car boundary boxes and estimated (front-passenger wheel) position to tune and test the algorithms against human estimations.</>,
		<>Made a stereo distance sensing module on an arduino to test system accuracy. Actual testing still in the TODO phase since I have put off building a vibration-proof mount for it.</>,
	],
);

const langtonPlant = makeExperiencePoint(
	"Oct 25 - Current",
	"Personal Project | Selecting LLM-Generated Agents for Survival in a Gridworld",
	[
		<>Built a TypeScript viewer for configurable Langton's-Ant-style agents on a grid.</>,
		<>Will be used to experiment with modeling a "genetically" diverse population in an "social" environment with imposed criteria for survival and reproduction.</>,
		<>Will be hosted at <a href="http://localhost:3000/langton">personal-website.url/langton</a>.</>,
	],
	"http://localhost:3000/langton"
);
export const projects = [
	uptonAir,
	langtonPlant,
	passingDistanceExtractor,
	fridgE,
];

 