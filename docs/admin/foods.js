import { loadHeader, checkAdminAccess } from './utils.js';

loadHeader();
checkAdminAccess();

const token = localStorage.getItem('token');

const foodsTableBody = document.querySelector('#foodsTable tbody');
const btnAddFood = document.getElementById('btnAddFood');
const overlay = document.getElementById('overlay');
const foodForm = document.getElementById('foodForm');
const formFood = document.getElementById('formFood');
const formTitle = document.getElementById('formTitle');
const btnCancel = document.getElementById('btnCancel');

const inputFoodId = document.getElementById('foodId');
const inputName = document.getElementById('foodName');
const inputPrice = document.getElementById('foodPrice');
const selectCategory = document.getElementById('foodCategory');
const inputTags = document.getElementById('foodTags');
const textareaDescription = document.getElementById('foodDescription');
const selectIsCombo = document.getElementById('foodIsCombo');
const inputImage = document.getElementById('foodImage');

let categories = [];
let foods = [];

async function fetchCategories() {
  try {
    const res = await fetch('https://viper-w65l.onrender.com/api/admin/categories', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Lỗi khi tải danh mục');
    categories = await res.json();
    selectCategory.innerHTML = categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  } catch (e) {
    alert(e.message);
  }
}

async function fetchFoods() {
  try {
    const res = await fetch('https://viper-w65l.onrender.com/api/admin/foods', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Lỗi khi tải món ăn');
    }
    foods = await res.json();
    renderFoods();
  } catch (e) {
    foodsTableBody.innerHTML = `<tr><td colspan="9" style="color:red">${e.message}</td></tr>`;
  }
}

function renderFoods() {
  if (foods.length === 0) {
    foodsTableBody.innerHTML = `<tr><td colspan="9">Không có món ăn nào.</td></tr>`;
    return;
  }
  foodsTableBody.innerHTML = '';
  foods.forEach(food => {
    foodsTableBody.insertAdjacentHTML('beforeend', `
      <tr>
        <td>${food.id}</td>
        <td>${food.image_url ? `<img class="food-img" src="${food.image_url}" alt="${food.name}">` : ''}</td>
        <td>${food.name}</td>
        <td>${Number(food.price).toLocaleString()}đ</td>
        <td>${food.category_name}</td>
        <td>${food.tags?.join(', ') || ''}</td>
        <td>${food.description || ''}</td>
        <td>${food.is_combo ? 'Có' : 'Không'}</td>
        <td>
          <button class="btn-edit" data-id="${food.id}">Sửa</button>
          <button class="btn-delete" data-id="${food.id}">Xóa</button>
        </td>
      </tr>
    `);
  });
}

function openForm(editFood = null) {
  overlay.style.display = 'block';
  foodForm.style.display = 'block';
  if (editFood) {
    formTitle.textContent = `Sửa món: ${editFood.name}`;
    inputFoodId.value = editFood.id;
    inputName.value = editFood.name;
    inputPrice.value = editFood.price;
    selectCategory.value = editFood.category_id;
    inputTags.value = (editFood.tags || []).join(', ');
    textareaDescription.value = editFood.description || '';
    selectIsCombo.value = editFood.is_combo ? '1' : '0';
    inputImage.value = ''; // Không reset ảnh
  } else {
    formTitle.textContent = 'Thêm món mới';
    inputFoodId.value = '';
    formFood.reset();
  }
}

function closeForm() {
  overlay.style.display = 'none';
  foodForm.style.display = 'none';
}

btnAddFood.addEventListener('click', () => openForm());

btnCancel.addEventListener('click', (e) => {
  e.preventDefault();
  closeForm();
});

overlay.addEventListener('click', () => {
  closeForm();
});

foodsTableBody.addEventListener('click', async (e) => {
  if (e.target.classList.contains('btn-edit')) {
    const id = e.target.dataset.id;
    const food = foods.find(f => f.id == id);
    if (food) {
      openForm(food);
    }
  } else if (e.target.classList.contains('btn-delete')) {
    const id = e.target.dataset.id;
    if (confirm('Bạn có chắc muốn xóa món này?')) {
      try {
        const res = await fetch(`https://viper-w65l.onrender.com/api/admin/foods/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Lỗi khi xóa món');
        }
        alert('Xóa món thành công');
        await fetchFoods();
      } catch (e) {
        alert(e.message);
      }
    }
  }
});

formFood.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = inputFoodId.value;
  const name = inputName.value.trim();
  const price = Number(inputPrice.value);
  const category_id = selectCategory.value;
  const tags = inputTags.value.split(',').map(t => t.trim()).filter(t => t);
  const description = textareaDescription.value.trim();
  const is_combo = selectIsCombo.value === '1';

  const formData = new FormData();
  formData.append('name', name);
  formData.append('price', price);
  formData.append('category_id', category_id);
  formData.append('tags', tags);
  formData.append('description', description);
  formData.append('is_combo', is_combo ? '1' : '0');

  if (inputImage.files.length > 0) {
    formData.append('image', inputImage.files[0]);
  } else if (id) {
    // Khi edit mà không chọn ảnh mới, gửi image_url để giữ nguyên
    const existingFood = foods.find(f => f.id == id);
    if (existingFood && existingFood.image_url) {
      formData.append('image_url', existingFood.image_url);
    }
  }

  try {
    let res;
    if (id) {
      res = await fetch(`https://viper-w65l.onrender.com/api/admin/foods/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
    } else {
      res = await fetch('https://viper-w65l.onrender.com/api/admin/foods', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
    }

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Lỗi khi lưu món ăn');
    }

    alert(id ? 'Cập nhật món ăn thành công' : 'Thêm món ăn thành công');
    closeForm();
    fetchFoods();
  } catch (e) {
    alert(e.message);
  }
});

(async () => {
  await fetchCategories();
  await fetchFoods();
})();
