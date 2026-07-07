import "./Problems.css";

const problems = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    language: "Java"
  },
  {
    id: 2,
    title: "Reverse String",
    difficulty: "Easy",
    language: "Python"
  },
  {
    id: 3,
    title: "Binary Search",
    difficulty: "Medium",
    language: "C++"
  },
  {
    id: 4,
    title: "Merge Intervals",
    difficulty: "Hard",
    language: "Java"
  },
  {
    id: 5,
    title: "Longest Palindrome",
    difficulty: "Medium",
    language: "Python"
  }
];

function Problems() {
  return (
    <div className="problems-page">

      <h1>Problem Bank</h1>

      <div className="filters">

        <input
          type="text"
          placeholder="Search Problems..."
        />

        <select>
          <option>All Difficulty</option>
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>

        <select>
          <option>All Languages</option>
          <option>Java</option>
          <option>Python</option>
          <option>C</option>
          <option>C++</option>
          <option>JavaScript</option>
        </select>

      </div>

      <table>

        <thead>

          <tr>

            <th>ID</th>

            <th>Problem</th>

            <th>Difficulty</th>

            <th>Language</th>

            <th>Action</th>

          </tr>

        </thead>

        <tbody>

          {problems.map((problem) => (

            <tr key={problem.id}>

              <td>{problem.id}</td>

              <td>{problem.title}</td>

              <td className={problem.difficulty.toLowerCase()}>
                {problem.difficulty}
              </td>

              <td>{problem.language}</td>

              <td>

                <button>

                  Solve

                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}

export default Problems;