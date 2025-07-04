// public/user/login.js
document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    const res = await fetch('https://viper-w65l.onrender.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Đăng nhập thất bại');

    // ✅ Lưu token và user vào localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    // ✅ Giải mã token để lấy vai trò
    const payload = JSON.parse(atob(data.token.split('.')[1]));
    const role = payload.role;

    alert('Đăng nhập thành công!');

    // ✅ Điều hướng theo vai trò
    if (role === 'admin' || role === 'staff') {
      window.location.href = '/admin/dashboard.html';
    } else {
      window.location.href = '/user/category.html';
    }

  } catch (err) {
    alert(err.message);
  }
});
