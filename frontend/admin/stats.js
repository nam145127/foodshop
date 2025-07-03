import { loadHeader } from './utils.js';

loadHeader();

const token = localStorage.getItem('token');

async function fetchStats() {
  try {
    const res = await fetch('http://localhost:3000/api/admin/stats', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Lỗi khi tải thống kê');
    }
    const data = await res.json();
    renderChartsAndTables(data);
  } catch (e) {
    alert('Lỗi: ' + e.message);
  }
}

function renderChartsAndTables({ dailyOrders, monthlyOrders }) {
  // --- Chart --- //
  const dailyLabels = dailyOrders.map(d => d.date);
  const monthlyLabels = monthlyOrders.map(m => m.month);

  // Đơn hàng ngày (bar)
  new Chart(document.getElementById('dailyOrdersChart'), {
    type: 'bar',
    data: {
      labels: dailyLabels,
      datasets: [{
        label: 'Số đơn hàng',
        data: dailyOrders.map(d => d.count),
        backgroundColor: '#3b82f6'
      }]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true } }
    }
  });

  // Doanh thu ngày (line)
  new Chart(document.getElementById('dailyRevenueChart'), {
    type: 'line',
    data: {
      labels: dailyLabels,
      datasets: [{
        label: 'Doanh thu (đồng)',
        data: dailyOrders.map(d => d.revenue),
        borderColor: '#10b981',
        backgroundColor: '#d1fae5',
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: val => val.toLocaleString('vi-VN') + 'đ'
          }
        }
      }
    }
  });

  // Đơn hàng tháng (bar)
  new Chart(document.getElementById('monthlyOrdersChart'), {
    type: 'bar',
    data: {
      labels: monthlyLabels,
      datasets: [{
        label: 'Số đơn hàng',
        data: monthlyOrders.map(m => m.count),
        backgroundColor: '#f97316'
      }]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true } }
    }
  });

  // Doanh thu tháng (line)
  new Chart(document.getElementById('monthlyRevenueChart'), {
    type: 'line',
    data: {
      labels: monthlyLabels,
      datasets: [{
        label: 'Doanh thu (đồng)',
        data: monthlyOrders.map(m => m.revenue),
        borderColor: '#ef4444',
        backgroundColor: '#fee2e2',
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: val => val.toLocaleString('vi-VN') + 'đ'
          }
        }
      }
    }
  });

  // --- Table --- //
  renderTable('dailyOrdersTable', ['Date', 'Count', 'Revenue'], dailyOrders.map(d => ({
    date: d.date,
    count: d.count,
    revenue: d.revenue.toLocaleString('vi-VN') + 'đ'
  })));

  renderTable('dailyRevenueTable', ['Date', 'Revenue'], dailyOrders.map(d => ({
    date: d.date,
    revenue: d.revenue.toLocaleString('vi-VN') + 'đ'
  })));

  renderTable('monthlyOrdersTable', ['Month', 'Count', 'Revenue'], monthlyOrders.map(m => ({
    month: m.month,
    count: m.count,
    revenue: m.revenue.toLocaleString('vi-VN') + 'đ'
  })));

  renderTable('monthlyRevenueTable', ['Month', 'Revenue'], monthlyOrders.map(m => ({
    month: m.month,
    revenue: m.revenue.toLocaleString('vi-VN') + 'đ'
  })));
}

function renderTable(tableId, columns, rows) {
  const table = document.getElementById(tableId);
  if (!table) return;

  // Tạo thead
  const thead = document.createElement('thead');
  const trHead = document.createElement('tr');
  columns.forEach(col => {
    const th = document.createElement('th');
    th.textContent = col;
    trHead.appendChild(th);
  });
  thead.appendChild(trHead);

  // Tạo tbody
  const tbody = document.createElement('tbody');
  rows.forEach(row => {
    const tr = document.createElement('tr');
    columns.forEach(col => {
      const key = col.toLowerCase();
      const td = document.createElement('td');
      td.textContent = row[key] !== undefined ? row[key] : '';
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  // Thay thế bảng cũ
  table.innerHTML = '';
  table.appendChild(thead);
  table.appendChild(tbody);
}

fetchStats();
