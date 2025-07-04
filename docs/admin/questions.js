import { loadHeader } from './utils.js';

const API = 'https://viper-w65l.onrender.com/api/admin/questions';
const token = localStorage.getItem('token');
const listEl = document.getElementById('questions-list');

async function fetchQuestions() {
  try {
    const res = await fetch(API, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Lỗi khi tải câu hỏi');
    return data;
  } catch (err) {
    console.error(err);
    listEl.innerHTML = `<tr><td colspan="10" style="color:red;">${err.message}</td></tr>`;
    return [];
  }
}

function renderQuestions(questions) {
  if (!questions.length) {
    listEl.innerHTML = `<tr><td colspan="10">Không có câu hỏi nào.</td></tr>`;
    return;
  }

  listEl.innerHTML = questions.map(q => `
    <tr data-id="${q.id}">
      <td>${q.id}</td>
      <td>${q.user_id || ''}</td>
      <td>${q.name}</td>
      <td>${q.email}</td>
      <td>${q.phone}</td>
      <td>${q.subject}</td>
      <td><pre>${q.message}</pre></td>
      <td>${new Date(q.created_at).toLocaleString()}</td>
      <td class="${q.is_read ? 'status-read' : 'status-unread'}">
        ${q.is_read ? 'Đã đọc' : 'Chưa đọc'}
      </td>
      <td>
        ${q.is_read 
          ? '' 
          : `<button class="mark-read-btn" data-id="${q.id}">Đánh dấu đã đọc</button>`
        }
      </td>
    </tr>
  `).join('');
}

async function markAsRead(id, button) {
  try {
    const res = await fetch(`https://viper-w65l.onrender.com/api/admin/questions/${id}/read`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Lỗi khi cập nhật trạng thái');
    }
    // Cập nhật UI
    const row = button.closest('tr');
    row.querySelector('td.status-read, td.status-unread').className = 'status-read';
    row.querySelector('td.status-read, td.status-unread').textContent = 'Đã đọc';
    button.remove();
  } catch (error) {
    alert('Lỗi khi đánh dấu đã đọc: ' + error.message);
  }
}

async function main() {
  await loadHeader();

  const questions = await fetchQuestions();
  renderQuestions(questions);

  listEl.addEventListener('click', e => {
    if (e.target.classList.contains('mark-read-btn')) {
      const id = e.target.dataset.id;
      markAsRead(id, e.target);
    }
  });
}

main();
