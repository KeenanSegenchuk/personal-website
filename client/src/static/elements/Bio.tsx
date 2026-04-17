import '../../App.scss';

type BioProps = {
  setState: ((value: string) => void) | null;
};

const Bio: React.FC<BioProps> = ({setState}) => {
  return (
    <div>
      <center><h1 className="s40 m10">About Me</h1></center>
      <p></p>
      <div className="flexRow">
	<img src="/pics/me/image000000.JPG" alt="Loading..."
		style={{width:"40%",height:"auto"}} 
	/>
	<div>
		<h1 className="m10 s20">
			Open to Work:
		</h1>
		<p className="m10 s18">
			Currently looking for employment as a Software Engineer / Full-Stack Developer
		</p>
		<h1 className="m10 s20">
			Academic Interests:
		</h1>
		<p className="m10 s18">
			Computer Science (machine/deep learning, signal processing, soft eng)
			<br/>
			Mathematics (modeling systems, discrete proofs)
			<br/>
			Biochemistry 
		</p>
		<h1 className="m10 s20">
			Hobbies:
		</h1>
		<p className="m10 s18">
			{setState !== null ?
				<a href="#" onClick={() => {setState("Outdoors");}}>The Wildlife</a>
			:<>The Wildlife</>}
			<br/>
			Bike Racing (Cyclocross, Mountain Bike)
			<br/>
			{setState !== null ?
				<a href="#" onClick={() => {setState("Gaming");}}>EGaming (Counter Strike, Overwatch)</a>
			:<>EGaming (Counter Strike, Overwatch)</>}
			<br/>
			Karate 
		</p>
	</div>
      </div>
    </div>
  );
};

export default Bio;