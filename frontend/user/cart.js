// 🔸 KHỞI TẠO GIỎ HÀNG
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// 🔸 HIỂN THỊ GIỎ HÀNG
function renderCart() {
  const tbody = document.querySelector("#cartTable tbody");
  tbody.innerHTML = "";
  let total = 0;

  if (cart.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center">🛒 Giỏ hàng đang trống</td></tr>`;
  } else {
    cart.forEach((item, index) => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.name}</td>
        <td>${item.price.toLocaleString("vi-VN")}₫</td>
        <td>
          <button onclick="changeQuantity(${index}, -1)">➖</button>
          ${item.quantity}
          <button onclick="changeQuantity(${index}, 1)">➕</button>
        </td>
        <td>${itemTotal.toLocaleString("vi-VN")}₫</td>
        <td><button onclick="removeItem(${index})">🗑️</button></td>
      `;
      tbody.appendChild(row);
    });
  }

  document.getElementById("totalPrice").textContent = total.toLocaleString("vi-VN") + "₫";
}

// 🔸 XOÁ MÓN KHỎI GIỎ
function removeItem(index) {
  cart.splice(index, 1);
  saveCart();
  renderCart();
}

// 🔸 TĂNG/GIẢM SỐ LƯỢNG
function changeQuantity(index, delta) {
  cart[index].quantity += delta;
  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }
  saveCart();
  renderCart();
}

// 🔸 LƯU GIỎ HÀNG
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// 🔸 ĐẶT HÀNG
function checkout() {
  if (cart.length === 0) {
    alert("🚫 Giỏ hàng đang trống!");
    return;
  }
  window.location.href = "order.html"; // hoặc thêm gọi API
}

// 🔸 GỌI KHI TẢI TRANG
renderCart();
