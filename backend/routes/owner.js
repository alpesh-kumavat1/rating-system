const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth");

router.put("/password", auth, async (req, res) => {
  try {
    if (req.user.role !== "OWNER") {
      return res.status(403).json({ error: "Access denied" });
    }

    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Both old and new password required" });
    }

    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [
      req.user.id,
    ]);
    if (rows.length === 0)
      return res.status(404).json({ error: "User not found" });

    const user = rows[0];
    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match)
      return res.status(400).json({ error: "Old password incorrect" });

    const hashedNew = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password = ? WHERE id = ?", [
      hashedNew,
      req.user.id,
    ]);

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/dashboard", auth, async (req, res) => {
  try {
    if (req.user.role !== "OWNER") {
      return res.status(403).json({ error: "Access denied" });
    }

    const [stores] = await pool.query(
      "SELECT * FROM stores WHERE owner_email = (SELECT email FROM users WHERE id = ?)",
      [req.user.id]
    );
    if (stores.length === 0)
      return res.status(404).json({ error: "No store found for owner" });

    const store = stores[0];

    const [ratings] = await pool.query(
      `
      SELECT u.id, u.name, u.email, r.rating, r.created_at
      FROM ratings r
      JOIN users u ON u.id = r.user_id
      WHERE r.store_id = ?
    `,
      [store.id]
    );

    // Average rating
    const [avgRes] = await pool.query(
      "SELECT AVG(rating) as average_rating FROM ratings WHERE store_id = ?",
      [store.id]
    );
    const average_rating = avgRes[0].average_rating
      ? Number(avgRes[0].average_rating).toFixed(2)
      : null;

    res.json({
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
      },
      users: ratings,
      average_rating,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
