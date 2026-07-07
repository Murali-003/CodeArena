import "./Login.css";
import { Link, useNavigate } from "react-router-dom";

function Login() {

  const navigate = useNavigate();

  return (
    <div className="login-container">

      <div className="login-card">

        <h1 className="logo">
          CodeArena
        </h1>

        <h2>Welcome Back</h2>

        <p className="subtitle">
          Login to continue your coding journey.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();

            navigate("/dashboard");
          }}
        >

          <div className="input-group">

            <label>Email</label>

            <input
              type="email"
              placeholder="Enter Email"
              required
            />

          </div>

          <div className="input-group">

            <label>Password</label>

            <input
              type="password"
              placeholder="Enter Password"
              required
            />

          </div>

          <button
            type="submit"
            className="login-btn"
          >
            Login
          </button>

        </form>

        <p className="bottom-text">

          Don't have an account?

          <Link to="/register">
            Register
          </Link>

        </p>

      </div>

    </div>
  );
}

export default Login;