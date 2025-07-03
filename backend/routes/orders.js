// backend/routes/orders.js
const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/authMiddleware");

router.post("/", auth, async (req, res) => {
  const { items, name, phone, address, voucher_code } = req.body;
  const user_id = req.user.id;

  if (!name || !phone || !address || !items || items.length === 0) {
    return res.status(400).json({ error: "Thiếu thông tin đơn hàng" });
  }

  try {
    let voucher_id = null;
    let discount = 0;
    let total_price = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    // Xử lý mã giảm giá nếu có
    if (voucher_code) {
      const [[voucher]] = await db.promise().execute(
        "SELECT * FROM vouchers WHERE code = ? AND expired_at > NOW()",
        [voucher_code]
      );

      if (voucher && total_price >= voucher.min_order) {
        voucher_id = voucher.id;
        discount = voucher.discount_type === "percent"
          ? Math.floor((voucher.discount_value / 100) * total_price)
          : voucher.discount_value;
      }
    }

    // Tạo đơn hàng
    const [orderResult] = await db.promise().execute(
      `INSERT INTO orders 
        (user_id, order_date, status, total_price, voucher_id, discount_applied, customer_name, customer_phone, customer_address) 
        VALUES (?, NOW(), 'pending', ?, ?, ?, ?, ?, ?)`,
      [user_id, total_price - discount, voucher_id, discount, name, phone, address]
    );

    const orderId = orderResult.insertId;

    // Thêm món ăn vào order_items
    for (let item of items) {
      await db.promise().execute(
        `INSERT INTO order_items (order_id, food_id, quantity, price)
         VALUES (?, ?, ?, ?)`,
        [orderId, item.id, item.quantity, item.price]
      );
    }

    // Nếu voucher riêng tư thì thêm vào user_vouchers
    if (voucher_id) {
      const [[voucherInfo]] = await db.promise().execute(
        "SELECT is_public FROM vouchers WHERE id = ?",
        [voucher_id]
      );
      if (!voucherInfo.is_public) {
        await db.promise().execute(
          "INSERT INTO user_vouchers (user_id, voucher_id, used_at) VALUES (?, ?, NOW())",
          [user_id, voucher_id]
        );
      }
    }

    res.json({ success: true, order_id: orderId });
  } catch (err) {
    console.error("Lỗi tạo đơn hàng:", err);
    res.status(500).json({ error: "Lỗi tạo đơn hàng" });
  }
});

module.exports = router;
