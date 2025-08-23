import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Auth.css";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    role: "user",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/signup", form);
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.error || "Signup failed");
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSignup} className="auth-box">
        <h2>Signup</h2>
        <input name="name" placeholder="Name" onChange={handleChange} />
        <input name="email" placeholder="Email" onChange={handleChange} />
        <input name="address" placeholder="Address" onChange={handleChange} />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
        />
        <select name="role" onChange={handleChange}>
          <option value="user">User</option>
          <option value="Owner">Store Owner</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit">Signup</button>
        <p onClick={() => navigate("/")} className="link">
          Already have an account? Login
        </p>
      </form>
    </div>
  );
}
