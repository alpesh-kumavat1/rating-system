import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./UserDashboard.css";

const API_URL = "http://localhost:5000/api/user";

export default function UserDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (!token || role !== "USER") navigate("/");
  }, [token, role, navigate]);

  const authHeader = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  );

  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const fetchStores = useCallback(
    async (query = "") => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/stores`, {
          params: query ? { search: query } : {},
          headers: authHeader,
        });
        setStores(res.data || []);
      } catch (err) {
        console.error(err);
        showToast("Failed to load stores", "error");
      } finally {
        setLoading(false);
      }
    },
    [authHeader]
  );

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  useEffect(() => {
    const id = setTimeout(() => fetchStores(search.trim()), 400);
    return () => clearTimeout(id);
  }, [search, fetchStores]);

  const submitRating = async (storeId, rating) => {
    try {
      await axios.post(
        `${API_URL}/stores/${storeId}/rating`,
        { rating },
        { headers: authHeader }
      );
      showToast("Rating saved!");
      setStores((prev) =>
        prev.map((s) => (s.id === storeId ? { ...s, user_rating: rating } : s))
      );
    } catch (err) {
      console.error(err);
      showToast("Failed to save rating", "error");
    }
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
      const res = await axios.put(
        `${API_URL}/password`,
        { oldPassword, newPassword },
        { headers: authHeader }
      );

      if (res.data?.error) {
        showToast(res.data.error, "error");
        return;
      }

      setPasswordModalOpen(false);
      e.currentTarget.reset();
      showToast(res.data?.message || "Password updated!");
    } catch (err) {
      console.error(err);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <div className="ud-wrap">
      <header className="ud-header">
        <h1>⭐ Store Ratings</h1>
        <div className="ud-header-buttons">
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

      <section className="ud-toolbar">
        <input
          className="input"
          type="text"
          placeholder="🔍 Search by store name or address…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </section>

      {loading ? (
        <div className="grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div className="card skeleton" key={i}></div>
          ))}
        </div>
      ) : stores.length === 0 ? (
        <div className="empty">🚫 No stores found</div>
      ) : (
        <div className="grid">
          {stores.map((store) => (
            <article className="card" key={store.id}>
              <h3>{store.name}</h3>
              <p className="muted">{store.address}</p>
              <div className="stats">
                <p>⭐ Overall: {store.overall_rating ?? "—"}</p>
                <p>👤 You: {store.user_rating || "Not rated"}</p>
              </div>
              <div className="stars">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    className={`star ${store.user_rating >= n ? "active" : ""}`}
                    onClick={() => submitRating(store.id, n)}
                  >
                    ★
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}

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
