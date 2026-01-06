import React from 'react';
import "../App.css";
import TabSelector, { TabSelectorProps } from "./TabSelector";

type HeaderProps = {
  tabProps?: TabSelectorProps;
};

const Header = (props: HeaderProps = {}) => {
	return (
		<div style = {{height: "90px", width: "100%", color: "#FFA07A", border: "4px solid #FFA07A", backgroundImage: "url(header_img.jpg)"}}>
			<div className = "flexRow" style = {{marginLeft: "15px", height: "100%"}}>
			    <div className = "flexCol">
				<h1 className="header-nowrap" style = {{margin: "0 0"}}>
					Keenan Segenchuk
				</h1>
				<h2 className="header-nowrap" style = {{margin: "0 0"}}>
					Software Engineer building data-driven applications
				</h2>
			    </div>
			    {props.tabProps &&
			    	<TabSelector {...props.tabProps}/>
			    }
			</div>
		</div>
	);
}
export default Header;