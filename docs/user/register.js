
document.getElementById('registerForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    const res = await fetch('https://viper-w65l.onrender.com/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Đăng ký thất bại');

    alert('Đăng ký thành công! Chuyển đến trang đăng nhập...');
    window.location.href = '/frontend/user/login.html';

  } catch (err) {
    alert(err.message);
  }
});
