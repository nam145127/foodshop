export function loadHeader() {
  document.getElementById('header').innerHTML = `
    <header>
      <nav>
        <a href="dashboard.html">🏠 Trang chủ</a>
        <a href="orders.html">🧾 Đơn hàng</a>
        <a href="foods.html">🍔 Món ăn</a>
        <a href="users.html">👤 Người dùng</a>
        <a href="questions.html">❓ Câu hỏi</a>
        <a href="stats.html">📊 Thống kê</a>
        <a href="#" id="logoutBtn">🚪 Đăng xuất</a>
      </nav>
    </header>
  `;

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.clear();
      window.location.href = '/user/login.html';
    });
  }
}
