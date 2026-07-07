import "./Leaderboard.css";

const users = [
  {
    rank: 1,
    name: "Likhitha",
    solved: 250,
    accuracy: "98%",
    language: "Java",
  },
  {
    rank: 2,
    name: "Rahul",
    solved: 220,
    accuracy: "96%",
    language: "Python",
  },
  {
    rank: 3,
    name: "Sneha",
    solved: 205,
    accuracy: "94%",
    language: "C++",
  },
  {
    rank: 4,
    name: "Ajay",
    solved: 180,
    accuracy: "91%",
    language: "JavaScript",
  },
];

function Leaderboard() {
  return (
    <div className="leaderboard">

      <h1>🏆 Global Leaderboard</h1>

      <table>

        <thead>

          <tr>

            <th>Rank</th>

            <th>User</th>

            <th>Problems Solved</th>

            <th>Accuracy</th>

            <th>Favorite Language</th>

          </tr>

        </thead>

        <tbody>

          {users.map((user) => (

            <tr key={user.rank}>

              <td>{user.rank}</td>

              <td>{user.name}</td>

              <td>{user.solved}</td>

              <td>{user.accuracy}</td>

              <td>{user.language}</td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}

export default Leaderboard;