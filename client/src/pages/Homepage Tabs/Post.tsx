const type PostProps = {
	html: string;
	title: string;
	date: string;
};
const Post: React.FC = ({html, title, date}: PostProps) => {
	return <div>
		<h1>{title}</h1>
		<div dangerouslySetInnerHTML={{__html:html}}/>
		<p style={{fontSize: ".8e", textAlign: "right"}}>{date}</p>
	      </div>
;}; 