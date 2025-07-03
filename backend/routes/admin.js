const express = require('express');
const router = express.Router();
const db = require('../db'); 
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/upload'); 





router.put('/orders/:id', auth, (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;
  const changedBy = req.user.id; // id người thực hiện thay đổi
  const changedAt = new Date();

  db.query('UPDATE orders SET status = ? WHERE id = ?', [status, orderId], err => {
    if (err) return res.status(500).json({ error: 'Lỗi khi cập nhật trạng thái' });

    db.query(
      'INSERT INTO order_status_logs (order_id, status, changed_by, changed_at) VALUES (?, ?, ?, ?)',
      [orderId, status, changedBy, changedAt],
      err2 => {
        if (err2) {
          console.error('Lỗi lưu lịch sử trạng thái:', err2);
          return res.status(500).json({ error: 'Lỗi lưu lịch sử trạng thái' });
        }
        res.json({ message: 'Cập nhật trạng thái và lưu lịch sử thành công' });
      }
    );
  });
});

// ===================== CÂU HỎI KHÁCH HÀNG =====================

router.get('/users', auth, (req, res) => {
  db.query(
    `SELECT id, name, email, role, created_at
     FROM users
     WHERE role != 'admin'
     ORDER BY created_at DESC`,
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Lỗi khi lấy người dùng' });
      res.json(rows);
    }
  );
});

// Cập nhật role user
router.put('/users/:id/role', auth, (req, res) => {
  const userId = req.params.id;
  const { role } = req.body;
  const validRoles = ['user', 'staff']; // admin không được cập nhật qua đây

  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'Vai trò không hợp lệ' });
  }

  db.query(
    'UPDATE users SET role = ? WHERE id = ? AND role != "admin"',
    [role, userId],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Lỗi khi cập nhật vai trò' });
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Người dùng không tồn tại hoặc không thể cập nhật admin' });
      }
      res.json({ message: 'Cập nhật vai trò thành công' });
    }
  );
});

// ===================== ĐƠN HÀNG =====================
router.get('/orders', auth, (req, res) => {
  db.query('SELECT * FROM orders ORDER BY order_date DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Lỗi khi lấy đơn hàng' });
    res.json(rows);
  });
});

router.get('/orders/:id', auth, (req, res) => {
  const orderId = req.params.id;
  db.query(
    `SELECT oi.id, oi.food_id, f.name, oi.quantity, oi.price
     FROM order_items oi
     JOIN foods f ON oi.food_id = f.id
     WHERE oi.order_id = ?`,
    [orderId],
    (err, items) => {
      if (err) return res.status(500).json({ error: 'Lỗi khi lấy chi tiết đơn hàng' });
      res.json(items);
    }
  );
});

router.put('/orders/:id', auth, (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;
  db.query('UPDATE orders SET status = ? WHERE id = ?', [status, orderId], err => {
    if (err) return res.status(500).json({ error: 'Lỗi khi cập nhật trạng thái' });
    res.json({ message: 'Cập nhật thành công' });
  });
});

// ===================== MÓN ĂN =====================
router.get('/foods', auth, (req, res) => {
  db.query(
    `SELECT f.*, c.name AS category_name
     FROM foods f
     JOIN categories c ON f.category_id = c.id`,
    async (err, foods) => {
      if (err) return res.status(500).json({ error: 'Lỗi khi lấy món ăn' });

      try {
        const promises = foods.map(food => new Promise((resolve, reject) => {
          db.query('SELECT tag FROM food_tags WHERE food_id = ?', [food.id], (err, tags) => {
            if (err) return reject(err);
            food.tags = tags.map(t => t.tag);
            resolve();
          });
        }));

        await Promise.all(promises);
        res.json(foods);
      } catch (err) {
        res.status(500).json({ error: 'Lỗi khi lấy tag món ăn' });
      }
    }
  );
});

router.post('/foods', auth, upload.single('image'), (req, res) => {
  const { name, price, category_id, description, is_combo } = req.body;
  let tags = req.body.tags || [];
  if (typeof tags === 'string') tags = [tags];

  const image_url = req.file?.path;
  db.query(
    'INSERT INTO foods (name, price, image_url, category_id, description, sold, is_combo) VALUES (?, ?, ?, ?, ?, 0, ?)',
    [name, price, image_url, category_id, description, is_combo],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Lỗi khi thêm món ăn' });

      const foodId = result.insertId;
      const tagValues = tags.map(tag => [foodId, tag]);
      if (tagValues.length === 0) return res.json({ message: 'Thêm món ăn thành công' });

      db.query('INSERT INTO food_tags (food_id, tag) VALUES ?', [tagValues], err2 => {
        if (err2) return res.status(500).json({ error: 'Lỗi khi thêm tags' });
        res.json({ message: 'Thêm món ăn thành công' });
      });
    }
  );
});

router.put('/foods/:id', auth, upload.single('image'), (req, res) => {
  const foodId = req.params.id;
  const { name, price, category_id, description, is_combo } = req.body;
  let tags = req.body.tags || [];
  if (typeof tags === 'string') tags = [tags];

  const image_url = req.file?.path || req.body.image_url;
  db.query(
    'UPDATE foods SET name = ?, price = ?, image_url = ?, category_id = ?, description = ?, is_combo = ? WHERE id = ?',
    [name, price, image_url, category_id, description, is_combo, foodId],
    err => {
      if (err) return res.status(500).json({ error: 'Lỗi khi cập nhật món ăn' });

      db.query('DELETE FROM food_tags WHERE food_id = ?', [foodId], err2 => {
        if (err2) return res.status(500).json({ error: 'Lỗi khi xoá tag cũ' });

        const tagValues = tags.map(tag => [foodId, tag]);
        if (tagValues.length === 0) return res.json({ message: 'Cập nhật món ăn thành công' });

        db.query('INSERT INTO food_tags (food_id, tag) VALUES ?', [tagValues], err3 => {
          if (err3) return res.status(500).json({ error: 'Lỗi khi thêm tag mới' });
          res.json({ message: 'Cập nhật món ăn thành công' });
        });
      });
    }
  );
});

router.delete('/foods/:id', auth, (req, res) => {
  const foodId = req.params.id;
  db.query('DELETE FROM food_tags WHERE food_id = ?', [foodId], err => {
    if (err) return res.status(500).json({ error: 'Lỗi khi xoá tag' });

    db.query('DELETE FROM foods WHERE id = ?', [foodId], err2 => {
      if (err2) return res.status(500).json({ error: 'Lỗi khi xoá món ăn' });
      res.json({ message: 'Xoá món ăn thành công' });
    });
  });
});

// ===================== DANH MỤC =====================
router.get('/categories', auth, (req, res) => {
  db.query('SELECT * FROM categories', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Lỗi khi lấy danh mục' });
    res.json(rows);
  });
});

// ===================== NGƯỜI DÙNG =====================
router.get('/users', auth, (req, res) => {
  db.query(
    'SELECT id, name, email, created_at FROM users ORDER BY created_at DESC',
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Lỗi khi lấy người dùng' });
      res.json(rows);
    }
  );
});
// ===================== CÂU HỎI =====================
router.get('/questions', auth, (req, res) => {
  const sql = `
    SELECT id, user_id, name, email, phone, subject, message, created_at, is_read
    FROM messages
    ORDER BY created_at DESC
  `;

  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Lỗi khi lấy câu hỏi' });
    res.json(rows);
  });
});

router.put('/questions/:id/read', auth, (req, res) => {
  const questionId = req.params.id;
  db.query('UPDATE messages SET is_read = 1 WHERE id = ?', [questionId], err => {
    if (err) return res.status(500).json({ error: 'Lỗi khi cập nhật trạng thái đã đọc' });
    res.json({ message: 'Cập nhật thành công' });
  });
});


// ===================== THỐNG KÊ =====================
router.get('/stats', auth, (req, res) => {
  db.query(
    `SELECT DATE(order_date) AS date, COUNT(*) AS count, SUM(total_price) AS revenue
     FROM orders
     WHERE order_date >= CURDATE() - INTERVAL 7 DAY
     GROUP BY DATE(order_date)
     ORDER BY DATE(order_date)`,
    (err, daily) => {
      if (err) return res.status(500).json({ error: 'Lỗi thống kê ngày' });

      db.query(
        `SELECT DATE_FORMAT(order_date, '%Y-%m') AS month, COUNT(*) AS count, SUM(total_price) AS revenue
         FROM orders
         WHERE order_date >= CURDATE() - INTERVAL 12 MONTH
         GROUP BY DATE_FORMAT(order_date, '%Y-%m')
         ORDER BY month`,
        (err2, monthly) => {
          if (err2) return res.status(500).json({ error: 'Lỗi thống kê tháng' });
          res.json({ dailyOrders: daily, monthlyOrders: monthly });
        }
      );
    }
  );
});

module.exports = router;
