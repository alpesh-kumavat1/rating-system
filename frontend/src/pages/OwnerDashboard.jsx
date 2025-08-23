import  { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./owner.css";

export default function OwnerDashboard() {
  const [store, setStore] = useState(null);
  const [users, setUsers] = useState([]);
  const [averageRating, setAverageRating] = useState(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const navigate = useNavigate();

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "OWNER") {
      navigate("/login");
      return;
    }

    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:5000/api/owner/dashboard",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setStore(res.data.store);
        setUsers(res.data.users);
        setAverageRating(res.data.average_rating);
      } catch (err) {
        setError(err.response?.data?.error || "Something went wrong");
      }
    };
    fetchDashboard();
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const oldPassword = form.get("oldPassword");
    const newPassword = form.get("newPassword");

    if (!oldPassword || !newPassword) {
      showToast("Please fill both fields", "error");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "http://localhost:5000/api/owner/password",
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPasswordModalOpen(false);
      e.currentTarget.reset();
      showToast("Password updated successfully!");
    } catch (err) {
      showToast(err.response?.data?.error || "Password update failed", "error");
    }
  };

  return (
    <div className="owner-dashboard">
      <header className="owner-header">
        <h1>Owner Dashboard</h1>
        <div className="owner-header-buttons">
          <button
            className="btn ghost"
            onClick={() => setPasswordModalOpen(true)}
          >
            Update Password
          </button>
          <button className="btn danger" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      {error && <p className="error">{error}</p>}

      {store && (
        <div className="store-info">
          <h2>Store Info</h2>
          <p>
            <strong>Name:</strong> {store.name}
          </p>
          <p>
            <strong>Email:</strong> {store.email}
          </p>
          <p>
            <strong>Address:</strong> {store.address}
          </p>
          <p>
            <strong>Average Rating:</strong> {averageRating || "No ratings yet"}
          </p>
        </div>
      )}

      {users.length > 0 ? (
        <div className="ratings-info">
          <h2>Users Who Rated</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Rating</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.rating}</td>
                  <td>{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !error && (
          <p className="no-ratings">No users have rated your store yet.</p>
        )
      )}

      {/* Password Modal */}
      {passwordModalOpen && (
        <div
          className="modal-backdrop"
          onClick={() => setPasswordModalOpen(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Update Password</h3>
            <form onSubmit={handlePasswordUpdate}>
              <input
                className="input"
                name="oldPassword"
                type="password"
                placeholder="Old password"
              />
              <input
                className="input"
                name="newPassword"
                type="password"
                placeholder="New password"
              />
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => setPasswordModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn">
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}
