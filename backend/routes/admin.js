const express = require("express");
const pool = require("../db");
const bcrypt = require("bcryptjs");
const router = express.Router();

router.get("/dashboard", async (req, res) => {
  try {
    const [usersCount] = await pool.query(
      "SELECT COUNT(*) AS total FROM users"
    );

    const [storesCount] = await pool.query(
      "SELECT COUNT(*) AS total FROM stores"
    );

    const [ratingsCount] = await pool.query(
      "SELECT COUNT(*) AS total FROM ratings"
    );

    const [users] = await pool.query(`
  SELECT u.id, u.name, u.email, u.address, u.role,
  CASE WHEN LOWER(u.role)='owner' 
       THEN (SELECT AVG(r.rating) 
             FROM ratings r 
             JOIN stores s2 ON r.store_id = s2.id 
             WHERE s2.owner_email = u.email) 
       ELSE NULL 
  END AS rating
  FROM users u
`);

    const [stores] = await pool.query(`
  SELECT s.id, s.name, s.email, s.address, s.owner_email,
         IFNULL(AVG(r.rating),0) AS rating
  FROM stores s
  LEFT JOIN ratings r ON r.store_id = s.id
  GROUP BY s.id
`);

    res.json({
      stats: {
        users: usersCount[0].total,
        stores: storesCount[0].total,
        ratings: ratingsCount[0].total,
      },
      users,
      stores,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/users", async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)",
      [name, email, hashedPassword, address, role]
    );

    res.json({ message: "User added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/stores", async (req, res) => {
  try {
    const { name, email, address, owner_email } = req.body;

    if (!name || !email || !address || !owner_email) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const [existingUser] = await pool.query(
      "SELECT * FROM users WHERE email = ? AND role='OWNER'",
      [owner_email]
    );

    if (existingUser.length === 0) {
      return res.status(400).json({
        error: `Owner with email ${owner_email} does not exist. Please add the owner first.`,
      });
    }

    await pool.query(
      "INSERT INTO stores (name, email, address, owner_email) VALUES (?, ?, ?, ?)",
      [name, email, address, owner_email]
    );

    res.json({ message: "Store added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
