import React from "react";
import Wideo from "../../static/util/Wideo";
import Post from "./Post";

const OutdoorsTab: React.FC = () => {
	return <div className="GamingTab">{posts()}</div>
};

const posts: React.FC[] = [
		<Post
			title="Latin Placeholder Text"
			html={
	<div>
		I ain't post nothing here yet, come back later.
	</div>
			date="4/16/26"
		/>
];
			
		

export default GamingTab;