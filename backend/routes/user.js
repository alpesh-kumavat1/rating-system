const express = require("express");
const pool = require("../db");
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth");
const router = express.Router();

router.put("/password", auth, async (req, res) => {
  try {
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

router.get("/stores", auth, async (req, res) => {
  try {
    const { search } = req.query;

    let query = `
      SELECT s.id, s.name, s.address,
        (SELECT ROUND(AVG(r.rating),2) FROM ratings r WHERE r.store_id = s.id) AS overall_rating,
        (SELECT r2.rating FROM ratings r2 WHERE r2.store_id = s.id AND r2.user_id = ?) AS user_rating
      FROM stores s
    `;
    const params = [req.user.id];

    if (search) {
      query += " WHERE s.name LIKE ? OR s.address LIKE ?";
      params.push(`%${search}%`, `%${search}%`);
    }

    const [stores] = await pool.query(query, params);
    res.json(stores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/stores/:id/rating", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    await pool.query(
      `INSERT INTO ratings (user_id, store_id, rating)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE rating = VALUES(rating), updated_at = CURRENT_TIMESTAMP`,
      [req.user.id, id, rating]
    );

    res.json({ message: "Rating submitted/updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/logout", auth, (req, res) => {
  try {
    res.json({ message: "Logout successful (clear token on frontend)" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
