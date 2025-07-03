const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/authMiddleware');

// Lấy thông tin người dùng
router.get('/profile', auth, async (req, res) => {
  try {
    const [rows] = await db.promise().execute(
      'SELECT id, name, email, role FROM users WHERE id = ?',
      [req.user.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
});

module.exports = router;