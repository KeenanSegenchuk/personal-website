import React from "react";
import Wideo from "../../static/util/Wideo";
import Post from "./Post";

const GamingTab: React.FC = () => {
	return <div className="GamingTab">{posts()}</div>
};


const posts: React.FC[] = [
		<Post
			title="First Post!"
			html={
	<div>
		<p>This marks the first blog-style post to my website... Even though the site's not up yet... 
		But I gotta have something to populate it or I'm posting air which is what my other website is for.</p>
		<p>Anyway, you can view montages on my youtube: <a>youtube.com/@MagicTurtle-c9f</a>. New one soon hopefully...</p>
		<div style={{height:"10px"}}/>
		<center><p>Or just watch my first one here:</p>
			<div style={{height:"5px"}}/>
			<Wideo wideo="eEhKsCxkjQY"/>
		</center>
	</div>
			date="4/16/26"
		/>
];
			
		

export default GamingTab;