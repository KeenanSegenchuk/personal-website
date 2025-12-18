import React from 'react';
import "../App.css";

function Header() {
	return (
		<div style = {{height: "90px", width: "100%", color: "#FFA07A", border: "4px solid #FFA07A", backgroundImage: "url(header_img.jpg)"}}>
			<div style = {{marginLeft: "15px"}}>
				<h1 className="header-nowrap" style = {{margin: "0 0"}}>
					Keenan Segenchuk
				</h1>
				<h2 className="header-nowrap" style = {{margin: "0 0"}}>
					Software Engineer building data-driven applications
				</h2>
			</div>
		</div>
	);
}
export default Header;