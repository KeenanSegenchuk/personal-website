import React from "react";
import Wideo from "../../static/util/Wideo";
import Post from "./Post";

const ProjectDirectory: React.FC = () => {
	const imgStyle: React.CSSProperties = {
	  width: "100%",
	  height: "100%",
	  objectFit: "cover",
	};

	const overlayStyle: React.CSSProperties = {
	  position: "absolute",
	  inset: 0,
	  display: "flex",
	  alignItems: "center",
	  justifyContent: "center",
	  background: "rgba(0,0,0,0.4)",
	  color: "white",
	};

	return <div className="ProjectDirectory">
		<div style={{ display: "flex", flexDirection: "row", gap: "16px" }}>
		  <a href="/langston" style={{ width: "150px", height: "150px", position: "relative" }}>
		    <img src="/pics/thumbnails/langston.jpg" style={imgStyle} />
		    <div style={overlayStyle}>Langston</div>
		  </a>

		  <a href="/fridge" style={{ width: "150px", height: "150px", position: "relative" }}>
		    <img src="/pics/thumbnails/fridge.jpg" style={imgStyle} />
		    <div style={overlayStyle}>Fridge</div>
		  </a>
		</div>

		<div style={{ marginTop: "16px" }}>
		  <a
		    href="https://upton-air.com"
		    style={{ width: "100%", height: "250px", position: "relative", display: "block" }}
		  >
		    <img src="/pics/thumbnails/uptonair.jpg" style={imgStyle} />
		    <div style={{ ...overlayStyle, fontSize: "20px" }}>Upton Air</div>
		  </a>
		</div>

		{posts()}
	</div>
};

const posts: React.FC[] = [

];
			
		

export default ProjectDirectory;