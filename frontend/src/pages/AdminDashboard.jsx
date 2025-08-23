import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "./Admin.css";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, stores: 0, ratings: 0 });
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({
    name: "",
    email: "",
    address: "",
    role: "",
  });
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    role: "User",
  });
  const [newStore, setNewStore] = useState({
    name: "",
    email: "",
    address: "",
    owner_email: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/api/admin/dashboard");
      setStats(res.data.stats);
      setUsers(res.data.users);
      setStores(res.data.stores);
    } catch (err) {
      alert(`Failed to load dashboard ${err}`);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/admin/users", newUser);
      alert("User added successfully");

      setNewUser({
        name: "",
        email: "",
        password: "",
        address: "",
        role: "User",
      });

      fetchDashboard();
    } catch {
      alert("Failed to add user");
    }
  };

  const handleAddStore = async (e) => {
    e.preventDefault();

    const ownerExists = users.some(
      (u) =>
        (u.role === "OWNER" || u.role === "Owner") &&
        u.email === newStore.owner_email
    );

    if (!ownerExists) {
      alert(
        `Owner with email ${newStore.owner_email} does not exist. Please add the owner first.`
      );
      return;
    }

    try {
      await api.post("/api/admin/stores", newStore);
      alert("Store added successfully");

      setNewStore({
        name: "",
        email: "",
        address: "",
        owner_email: "",
      });

      fetchDashboard();
    } catch {
      alert("Failed to add store");
    }
  };

  const roleMap = {
    User: "USER",
    Admin: "ADMIN",
    "Store Owner": "OWNER",
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(filters.name.toLowerCase()) &&
      u.email?.toLowerCase().includes(filters.email.toLowerCase()) &&
      u.address?.toLowerCase().includes(filters.address.toLowerCase()) &&
      (filters.role === "" || u.role === roleMap[filters.role])
  );

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="admin-container">
      <h1 className="dashboard-header">Admin Dashboard</h1>

      {/* Stats */}
      <div className="stats">
        <div className="card">Users: {stats.users}</div>
        <div className="card">Stores: {stats.stores}</div>
        <div className="card">Ratings: {stats.ratings}</div>
      </div>

      <div className="form-row">
        <div className="form-section">
          <h2>Add New User</h2>
          <form onSubmit={handleAddUser}>
            <input
              placeholder="Name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            />
            <input
              placeholder="Email"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
            />
            <input
              type="password"
              placeholder="Password"
              value={newUser.password}
              onChange={(e) =>
                setNewUser({ ...newUser, password: e.target.value })
              }
            />
            <input
              placeholder="Address"
              value={newUser.address}
              onChange={(e) =>
                setNewUser({ ...newUser, address: e.target.value })
              }
            />
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            >
              <option value="User">User</option>
              <option value="Admin">Admin</option>
              <option value="Owner">Store Owner</option>
            </select>
            <button type="submit">Add User</button>
          </form>
        </div>

        <div className="form-section">
          <h2>Add New Store</h2>
          <form onSubmit={handleAddStore}>
            <input
              placeholder="Store Name"
              value={newStore.name}
              onChange={(e) =>
                setNewStore({ ...newStore, name: e.target.value })
              }
              required
            />
            <input
              placeholder="Store Email"
              value={newStore.email}
              onChange={(e) =>
                setNewStore({ ...newStore, email: e.target.value })
              }
              required
            />
            <input
              placeholder="Store Address"
              value={newStore.address}
              onChange={(e) =>
                setNewStore({ ...newStore, address: e.target.value })
              }
              required
            />
            <input
              placeholder="Owner Email"
              value={newStore.owner_email}
              onChange={(e) =>
                setNewStore({ ...newStore, owner_email: e.target.value })
              }
              required
            />
            <button type="submit">Add Store</button>
          </form>
        </div>
      </div>

      <div className="filter-section">
        <h2>Filter Users</h2>
        <input
          placeholder="Name"
          value={filters.name}
          onChange={(e) => {
            setFilters({ ...filters, name: e.target.value });
            setCurrentPage(1);
          }}
        />
        <input
          placeholder="Email"
          value={filters.email}
          onChange={(e) => {
            setFilters({ ...filters, email: e.target.value });
            setCurrentPage(1);
          }}
        />
        <input
          placeholder="Address"
          value={filters.address}
          onChange={(e) => {
            setFilters({ ...filters, address: e.target.value });
            setCurrentPage(1);
          }}
        />
        <select
          value={filters.role}
          onChange={(e) => {
            setFilters({ ...filters, role: e.target.value });
            setCurrentPage(1);
          }}
        >
          <option value="">All Roles</option>
          <option value="User">User</option>
          <option value="Admin">Admin</option>
          <option value="Store Owner">Store Owner</option>
        </select>
      </div>

      <div className="list-section">
        <h2>Users</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Address</th>
              <th>Role</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.address}</td>
                <td>{u.role}</td>
                <td>{u.role === "Store Owner" ? u.rating : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={currentPage === i + 1 ? "active" : ""}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>

      <div className="list-section">
        <h2>Stores</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Address</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            {stores.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.email}</td>
                <td>{s.address}</td>
                <td>{s.rating}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}
