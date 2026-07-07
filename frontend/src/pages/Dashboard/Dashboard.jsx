import "./Dashboard.css";
import { Link } from "react-router-dom";
import {
  FaHome,
  FaCode,
  FaTrophy,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";

function Dashboard() {
  return (
    <div className="dashboard">

      {/* Sidebar */}
      <aside className="sidebar">
        <h2>CodeArena</h2>

        <ul>

          <li>
            <Link to="/dashboard">
              <FaHome /> Dashboard
            </Link>
          </li>

          <li>
            <Link to="/problems">
              <FaCode /> Problems
            </Link>
          </li>

          <li>
            <Link to="/leaderboard">
              <FaTrophy /> Leaderboard
            </Link>
          </li>

          <li>
            <Link to="/profile">
              <FaUser /> Profile
            </Link>
          </li>

          <li>
            <Link to="/">
              <FaSignOutAlt /> Logout
            </Link>
          </li>

        </ul>
      </aside>

      {/* Main Content */}
      <main className="main-content">

        <h1>Welcome to CodeArena 👋</h1>

        <p>
          Continue your coding journey and improve your programming skills.
        </p>

        <div className="dashboard-cards">

          <div className="card">
            <h3>Problems Solved</h3>
            <h2>24</h2>
          </div>

          <div className="card">
            <h3>Current Rank</h3>
            <h2>#152</h2>
          </div>

          <div className="card">
            <h3>Accuracy</h3>
            <h2>91%</h2>
          </div>

          <div className="card">
            <h3>Daily Streak</h3>
            <h2>18 Days</h2>
          </div>

        </div>

      </main>

    </div>
  );
}

export default Dashboard;