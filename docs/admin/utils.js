// /frontend/admin/utils.js
export function loadHeader() {
  fetch('header.html')
    .then(res => res.text())
    .then(html => {
      const header = document.createElement('div');
      header.innerHTML = html;
      document.body.insertBefore(header, document.body.firstChild);
    });
}
export function formatDate(dateString) {
  const d = new Date(dateString);
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function checkAdminAccess() {
  const token = localStorage.getItem('token');
  if (!token) return location.href = 'https://viper-w65l.onrender.com/user/login.html';
}

document.addEventListener('click', e => {
  if (e.target.id === 'logoutBtn') {
    localStorage.removeItem('token');
    location.href = 'https://viper-w65l.onrender.com/user/login.html';
  }
});