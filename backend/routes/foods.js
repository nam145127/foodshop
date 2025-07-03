const express = require('express');
const db = require('../db');
const router = express.Router();

// 🔸 Lấy món ăn theo category
router.get('/', (req, res) => {
  const { category_id } = req.query;
  const sql = category_id
    ? 'SELECT * FROM foods WHERE category_id = ?'
    : 'SELECT * FROM foods';

  db.query(sql, category_id ? [category_id] : [], (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi truy vấn món ăn' });
    res.json(results);
  });
});

// 🔍 Tìm kiếm món ăn theo tên hoặc mô tả
router.get('/search', (req, res) => {
  const { keyword } = req.query;
  if (!keyword) return res.json([]);

  const sql = 'SELECT * FROM foods WHERE name LIKE ? OR description LIKE ?';
  const search = `%${keyword}%`;

  db.query(sql, [search, search], (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi tìm kiếm' });
    res.json(results);
  });
});

// ⏰ Gợi ý theo thời gian (dựa vào bảng food_tags)
router.get('/suggest', (req, res) => {
  const { time } = req.query;
  if (!time) return res.status(400).json({ error: 'Thiếu tham số thời gian' });

  const sql = `
    SELECT f.* FROM foods f
    JOIN food_tags t ON f.id = t.food_id
    WHERE t.tag = ?
    LIMIT 8
  `;

  db.query(sql, [time], (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi gợi ý theo thời gian' });
    res.json(results);
  });
});

// 🔥 Món bán chạy (giả định sắp theo sold nếu có cột đó)
router.get('/popular', (req, res) => {
  const sql = 'SELECT * FROM foods ORDER BY RAND() LIMIT 8';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi món bán chạy' });
    res.json(results);
  });
});


// 🎁 Combo tiết kiệm
router.get('/combos', (req, res) => {
  const sql = `
    SELECT * FROM foods
    WHERE name LIKE "%combo%" OR is_combo = 1 
    LIMIT 8
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi combo' });
    res.json(results);
  });
});

// ➕ Gán tag thời gian cho món ăn (VD: sang, trua, toi)
router.post('/:id/tag', (req, res) => {
  const { id } = req.params;
  const { tag } = req.body;
  if (!tag) return res.status(400).json({ error: 'Thiếu tag' });

  const sql = 'INSERT INTO food_tags (food_id, tag) VALUES (?, ?)';
  db.query(sql, [id, tag], (err, result) => {
    if (err) return res.status(500).json({ error: 'Lỗi thêm tag' });
    res.json({ message: 'Đã thêm tag thành công' });
  });
});

// ❌ Xoá tag khỏi món ăn
router.delete('/:id/tag', (req, res) => {
  const { id } = req.params;
  const { tag } = req.body;
  if (!tag) return res.status(400).json({ error: 'Thiếu tag' });

  const sql = 'DELETE FROM food_tags WHERE food_id = ? AND tag = ?';
  db.query(sql, [id, tag], (err, result) => {
    if (err) return res.status(500).json({ error: 'Lỗi xoá tag' });
    res.json({ message: 'Đã xoá tag thành công' });
  });
});

module.exports = router;
