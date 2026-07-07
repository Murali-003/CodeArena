import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">

      <div className="logo">
        <Link to="/">CodeArena</Link>
      </div>

      <ul className="nav-links">

        <li>
          <Link to="/">Home</Link>
        </li>

        <li>
          <Link to="/problems">Problems</Link>
        </li>

        <li>
          <a href="#">Leaderboard</a>
        </li>

        <li>
          <a href="#">About</a>
        </li>

      </ul>

      <div className="nav-buttons">

        <Link to="/login">
          <button className="login-btn">Login</button>
        </Link>

        <Link to="/register">
          <button className="register-btn">Register</button>
        </Link>

      </div>

    </nav>
  );
}

export default Navbar;