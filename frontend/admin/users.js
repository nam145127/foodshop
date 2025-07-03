import { loadHeader, formatDate } from './utils.js';

loadHeader();

const token = localStorage.getItem('token');
const usersTableBody = document.querySelector('#usersTable tbody');

async function fetchUsers() {
  try {
    const res = await fetch('http://localhost:3000/api/admin/users', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Lỗi khi tải danh sách người dùng');
    }
    const users = await res.json();
    renderUsers(users);
  } catch (e) {
    usersTableBody.innerHTML = `<tr><td colspan="6" style="color:red">${e.message}</td></tr>`;
  }
}

function renderUsers(users) {
  if (users.length === 0) {
    usersTableBody.innerHTML = `<tr><td colspan="6">Không có người dùng nào.</td></tr>`;
    return;
  }
  usersTableBody.innerHTML = '';

  users.forEach(user => {
    usersTableBody.insertAdjacentHTML('beforeend', `
      <tr data-id="${user.id}">
        <td>${user.id}</td>
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>
          <select class="role-select">
            <option value="user" ${user.role === 'user' ? 'selected' : ''}>User</option>
            <option value="staff" ${user.role === 'staff' ? 'selected' : ''}>Staff</option>
          </select>
        </td>
        <td>${formatDate(user.created_at)}</td>
        <td><button class="btn-update-role">Cập nhật</button></td>
      </tr>
    `);
  });
}

// Bắt sự kiện cập nhật vai trò
usersTableBody.addEventListener('click', async (e) => {
  if (e.target.classList.contains('btn-update-role')) {
    const tr = e.target.closest('tr');
    const userId = tr.dataset.id;
    const select = tr.querySelector('.role-select');
    const newRole = select.value;

    try {
      const res = await fetch(`http://localhost:3000/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi cập nhật vai trò');

      alert('Cập nhật vai trò thành công');
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  }
});

fetchUsers();
