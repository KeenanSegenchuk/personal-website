import React from 'react';
import "../App.css";

type Tab = {
	title: string;
	key: string;
	color: string;
	fontColor?: string;
}

type TabProps = {
	tab: Tab;
	setKey: (key:string)=>void;
	selected: boolean;
}

export type TabSelectorProps = {
	tabs: Tab[];
	setKey: (key:string)=>void;
	selected: string;
}

const TabEl: React.FC<TabProps> = ({tab, setKey, selected}) => {
	return (
		<button className="tab-button" 
			style={{backgroundColor: tab.color, color: tab?.fontColor, border: selected ? "2px solid white" : undefined}} 
			onClick={() => setKey(tab.key)}>
		    {tab.title}
		</button>
	);
}

const TabSelector: React.FC<TabSelectorProps> = ({tabs, setKey, selected}) => {
	return (
		<div style={{width:"100%", display:"flex", alignItems:"flex-end", justifyContent:"flex-end"}}>
			{tabs.map((e, k) => <TabEl tab={e} setKey={setKey} selected={e.title === selected}/>)}
		</div>
	);

}
export default TabSelector;