const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/authMiddleware");

// Gửi câu hỏi (ai cũng gửi được, có thể kèm token để biết ai gửi)
router.post("/", async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  let user_id = null;

  try {
    // nếu gửi kèm token hợp lệ thì lưu user_id
    if (req.headers.authorization?.startsWith("Bearer ")) {
      const jwt = require("jsonwebtoken");
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, "secret_key"); // có thể đưa vào .env sau
      user_id = decoded.id;
    }
  } catch {}

  if (!name || !subject || !message) {
    return res.status(400).json({ error: "Thiếu thông tin cần thiết" });
  }

  try {
    await db.promise().execute(
      `INSERT INTO messages (user_id, name, email, phone, subject, message, created_at, is_read)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), 0)`,
      [user_id, name, email, phone, subject, message]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Lỗi lưu tin nhắn:", err);
    res.status(500).json({ error: "Lỗi lưu tin nhắn" });
  }
});

module.exports = router;
