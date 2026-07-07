import "./Features.css";
import { FaCode, FaTrophy, FaLaptopCode, FaChartLine } from "react-icons/fa";

function Features(){

return(

<section className="features">

<h2>

Why Choose CodeArena?

</h2>

<div className="cards">

<div className="card">

<FaLaptopCode size={45}/>

<h3>Live Coding</h3>

<p>Practice coding in multiple programming languages.</p>

</div>

<div className="card">

<FaCode size={45}/>

<h3>500+ Problems</h3>

<p>Easy Medium Hard Coding Challenges.</p>

</div>

<div className="card">

<FaTrophy size={45}/>

<h3>Leaderboard</h3>

<p>Compete with developers globally.</p>

</div>

<div className="card">

<FaChartLine size={45}/>

<h3>Track Progress</h3>

<p>Monitor your coding journey.</p>

</div>

</div>

</section>

)

}

export default Features;