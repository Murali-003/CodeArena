import "./Profile.css";

function Profile() {
  return (
    <div className="profile">

      <div className="profile-card">

        <img
          src="https://i.pravatar.cc/200"
          alt="Profile"
        />

        <h1>Likhitha</h1>

        <p>Java Full Stack Developer</p>

        <div className="stats">

          <div>

            <h2>250</h2>

            <span>Problems Solved</span>

          </div>

          <div>

            <h2>98%</h2>

            <span>Accuracy</span>

          </div>

          <div>

            <h2>#1</h2>

            <span>Rank</span>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Profile;