import "./Hero.css";
import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="hero">

      <div className="left">

        <h1>Practice Your Coding Skills Here</h1>

        <h3>Java • Python • C • C++ • JavaScript</h3>

        <p>
          Master coding interviews, improve problem-solving skills,
          compete on leaderboards, and track your progress with
          CodeArena.
        </p>

        <Link to="/problems">
          <button>Start Practicing</button>
        </Link>

      </div>

      <div className="right">

        <img
          src="https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=700"
          alt="Coding"
        />

      </div>

    </section>
  );
}

export default Hero;