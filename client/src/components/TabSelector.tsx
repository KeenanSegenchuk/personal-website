import React from 'react';
import "../App.css";

type Tab = {
	title: string;
	key: string;
	color: string;
}

type TabProps = {
	tab: Tab;
	setKey: (key:string)=>void;
}

export type TabSelectorProps = {
	tabs: Tab[];
	setKey: (key:string)=>void;
}

const Tab: React.FC<TabProps> = ({tab, setKey}) => {
	return (
		<button className="tab-button" style={{backgroundColor: tab.color}} onClick={() => setKey(tab.key)}>{tab.title}</button>
	);
}

const TabSelector: React.FC<TabSelectorProps> = ({tabs, setKey}) => {
	return (
		<div style={{width:"100%", display:"flex", alignItems:"flex-end", justifyContent:"flex-end"}}>
			{tabs.map((e, k) => <Tab tab={e} setKey={setKey}/>)}
		</div>
	);

}
export default TabSelector;