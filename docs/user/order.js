let cart = JSON.parse(localStorage.getItem("cart")) || [];
let appliedVoucher = null;
let discountAmount = 0;

function renderOrder() {
  const orderList = document.getElementById("orderItems");
  const totalEl = document.getElementById("orderTotal");

  orderList.innerHTML = "";
  let total = 0;

  if (cart.length === 0) {
    orderList.innerHTML = "<li>🛒 Không có món nào trong giỏ hàng.</li>";
    totalEl.textContent = "0₫";
    return;
  }

  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    const li = document.createElement("li");
    li.textContent = `${item.name} x ${item.quantity} = ${itemTotal.toLocaleString("vi-VN")}₫`;
    orderList.appendChild(li);
    total += itemTotal;
  });

  if (discountAmount > 0) {
    const discountLi = document.createElement("li");
    discountLi.textContent = `🎁 Giảm giá: -${discountAmount.toLocaleString("vi-VN")}₫`;
    orderList.appendChild(discountLi);
  }

  totalEl.textContent = (total - discountAmount).toLocaleString("vi-VN") + "₫";
}

renderOrder();

document.getElementById("applyVoucher").addEventListener("click", async () => {
  const code = document.getElementById("voucher").value.trim();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const token = localStorage.getItem("token");

  if (!code) return alert("❗ Hãy nhập mã giảm giá");

  try {
    const res = await fetch("https://viper-w65l.onrender.com/api/vouchers/check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({ code, total })
    });

    const data = await res.json();
    if (!data.valid) throw new Error(data.message);

    appliedVoucher = code;
    discountAmount = data.discount;

    document.getElementById("voucherMessage").textContent = `✅ Mã "${code}" đã áp dụng`;
    renderOrder();
  } catch (err) {
    discountAmount = 0;
    appliedVoucher = null;
    document.getElementById("voucherMessage").textContent = "❌ " + (err.message || "Lỗi khi áp dụng mã");
    renderOrder();
  }
});

document.getElementById("orderForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();

  if (!name || !phone || !address || cart.length === 0) {
    alert("🚫 Vui lòng điền đầy đủ thông tin và đảm bảo giỏ hàng không trống!");
    return;
  }

  try {
    const token = localStorage.getItem("token");

    const response = await fetch("https://viper-w65l.onrender.com/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({
        name,
        phone,
        address,
        items: cart,
        voucher_code: appliedVoucher
      })
    });

    const result = await response.json();

    if (result.success) {
      localStorage.removeItem("cart");
      alert("✅ Đặt hàng thành công!");
      window.location.href = "category.html";
    } else {
      throw new Error(result.error || "Đặt hàng thất bại");
    }
  } catch (err) {
    console.error("Lỗi đặt hàng:", err);
    alert("❌ Lỗi khi gửi đơn hàng. Vui lòng thử lại.");
  }
});
