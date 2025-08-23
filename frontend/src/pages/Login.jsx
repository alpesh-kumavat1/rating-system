import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Auth.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/login", {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);

      const { role } = JSON.parse(atob(res.data.token.split(".")[1]));
      localStorage.setItem("role", role);

      if (role === "ADMIN") navigate("/admin");
      else if (role === "OWNER") navigate("/owner");
      else if (role === "USER") navigate("/user");
    } catch (err) {
      alert(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleLogin} className="auth-box">
        <h2>Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
        <p onClick={() => navigate("/signup")} className="link">
          Don’t have an account? Signup
        </p>
      </form>
    </div>
  );
}
