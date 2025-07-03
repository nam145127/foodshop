import { loadHeader, checkAdminAccess, formatDate } from './utils.js';

loadHeader();
checkAdminAccess();

const token = localStorage.getItem('token');
const tableBody = document.querySelector('#ordersTable tbody');

fetch('http://localhost:3000/api/admin/orders', {
  headers: { Authorization: `Bearer ${token}` }
})
  .then(async res => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Không thể tải đơn hàng');
    renderOrders(data);
  })
  .catch(err => {
    tableBody.innerHTML = `<tr><td colspan="7" style="color:red">${err.message}</td></tr>`;
    console.error(err);
  });

function renderOrders(orders) {
  if (!orders.length) {
    tableBody.innerHTML = `<tr><td colspan="7">Không có đơn hàng nào.</td></tr>`;
    return;
  }

  tableBody.innerHTML = '';
  orders.forEach(order => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${order.id}</td>
      <td>${order.customer_name} - ${order.customer_phone}</td>
      <td>${formatDate(order.order_date)}</td>
      <td>
        <select data-id="${order.id}" class="status-select">
          <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Chờ xử lý</option>
          <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Đã xác nhận</option>
          <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Đã giao</option>
          <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Đã hủy</option>
        </select>
      </td>
      <td>${order.total_price.toLocaleString()}đ</td>
      <td>
        <button class="view-btn" data-id="${order.id}">Xem</button>
        <button class="update-btn" data-id="${order.id}">Cập nhật</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

tableBody.addEventListener('click', async e => {
  if (e.target.classList.contains('view-btn')) {
    const id = e.target.dataset.id;
    try {
      const res = await fetch(`http://localhost:3000/api/admin/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Lỗi khi lấy chi tiết đơn hàng');
      }
      const items = await res.json();

      let details = `Chi tiết đơn hàng #${id}:\n`;
      items.forEach(item => {
        details += `- ${item.name} x${item.quantity} = ${(item.price * item.quantity).toLocaleString()}đ\n`;
      });
      alert(details);
    } catch (err) {
      alert(`Lỗi: ${err.message}`);
    }
  }

  if (e.target.classList.contains('update-btn')) {
    const id = e.target.dataset.id;
    const select = tableBody.querySelector(`select.status-select[data-id="${id}"]`);
    const status = select.value;

    const confirmUpdate = confirm('Bạn có chắc muốn cập nhật trạng thái đơn hàng này không?');
    if (!confirmUpdate) return;

    try {
      const res = await fetch(`http://localhost:3000/api/admin/orders/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Lỗi cập nhật trạng thái');
      }
      alert('Cập nhật trạng thái thành công');
    } catch (err) {
      alert(`Lỗi: ${err.message}`);
    }
  }
});
