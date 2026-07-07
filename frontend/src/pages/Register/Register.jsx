import "./Register.css";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  return (
    
    <div className="register-container">
      <div className="register-card">

        <h1 className="logo">CodeArena</h1>

        <h2>Create Your Account</h2>
        <p className="subtitle">
          Start solving coding challenges today.
        </p>
        <form
  onSubmit={(e) => {
    e.preventDefault();

    alert("Registration Successful!");

    navigate("/login");
  }}
>

  <div className="input-group">
    <label>Username</label>
    <input
      type="text"
      placeholder="Enter username"
      required
    />
  </div>

  <div className="input-group">
    <label>Email</label>
    <input
      type="email"
      placeholder="Enter email"
      required
    />
  </div>

  <div className="input-group">
    <label>Password</label>
    <input
      type="password"
      placeholder="Enter password"
      required
    />
  </div>

  <div className="input-group">
    <label>Confirm Password</label>
    <input
      type="password"
      placeholder="Confirm password"
      required
    />
  </div>

  <button type="submit" className="register-btn">
    Register
  </button>

</form>

        <p className="bottom-text">
          Already have an account?
          <Link to="/login"> Login</Link>
        </p>

      </div>
    </div>
  );
}

export default Register;