const express = require("express");
const db = require("../db");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

router.post("/check", auth, async (req, res) => {
  const { code, total } = req.body;
  const userId = req.user.id;

  try {
    const [vouchers] = await db.promise().execute(
      "SELECT * FROM vouchers WHERE code = ? AND expired_at > NOW()",
      [code]
    );
    const voucher = vouchers[0];

    if (!voucher) return res.json({ valid: false, message: "Mã không tồn tại hoặc đã hết hạn" });

    if (total < voucher.min_order) {
      return res.json({ valid: false, message: `Đơn hàng phải từ ${voucher.min_order}₫` });
    }

    if (!voucher.is_public) {
      const [used] = await db.promise().execute(
        "SELECT * FROM user_vouchers WHERE user_id = ? AND voucher_id = ?",
        [userId, voucher.id]
      );
      if (used.length > 0) {
        return res.json({ valid: false, message: "Bạn đã sử dụng mã này rồi" });
      }
    }

    const discount = voucher.discount_type === "percent"
      ? Math.floor((voucher.discount_value / 100) * total)
      : voucher.discount_value;

    return res.json({ valid: true, discount });
  } catch (err) {
    console.error("Lỗi kiểm tra voucher:", err);
    res.status(500).json({ valid: false, message: "Lỗi server" });
  }
});

module.exports = router;
