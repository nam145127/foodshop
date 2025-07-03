const foodList = document.getElementById("foodList");
const title = document.getElementById("categoryTitle");

const modal = document.getElementById("modal");
const modalImg = document.getElementById("modal-img");
const modalName = document.getElementById("modal-name");
const modalDescription = document.getElementById("modal-description");
const modalPrice = document.getElementById("modal-price");
const modalIcon = document.getElementById("modal-icon");
const modalAdd = document.getElementById("modal-add");

const categoryNames = {
  1: '🍕 Pizza', 2: '🍔 Hamburger', 3: '🥤 Đồ uống', 4: '🌭 Hotdog',
  5: '🍗 Gà ', 6: '🍜 Mì ', 7: '🍱 Cơm', 8: '🍟 Đồ ăn vặt', 9: '🍰 Tráng miệng'
};

const categoryIcons = {
  1: '🍕', 2: '🍔', 3: '🥤', 4: '🌭',
  5: '🍗', 6: '🍜', 7: '🍱', 8: '🍟', 9: '🍰'
};

const params = new URLSearchParams(window.location.search);
const categoryId = params.get("category");
const keyword = params.get("search");

if (categoryId && categoryNames[categoryId]) {
  title.textContent = `📜 ${categoryNames[categoryId]}`;
} else if (keyword) {
  title.textContent = `🔍 Kết quả tìm "${keyword}"`;
}

function formatPrice(price) {
  return Number(price).toLocaleString('vi-VN') + "₫";
}

function renderFoodList(data) {
  foodList.innerHTML = '';
  if (!data || data.length === 0) {
    foodList.innerHTML = '<p>Không có món nào hiển thị.</p>';
    return;
  }

  data.forEach(food => {
    const box = document.createElement("div");
    box.className = "food-box";
    box.innerHTML = `
      <img src="${food.image_url}" alt="${food.name}">
      <div class="content">
        <h3>${food.name}</h3>
        <p>${food.description || ''}</p>
        <div class="price">${formatPrice(food.price)}</div>
        <button class="add-btn">🛒 Thêm vào giỏ</button>
      </div>
    `;

    box.addEventListener("click", (e) => {
      if (!e.target.classList.contains("add-btn")) {
        showDetailModal(food);
      }
    });

    box.querySelector(".add-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      addToCart(food); // ✅ truyền đầy đủ dữ liệu
    });

    foodList.appendChild(box);
  });
}

function loadFoods(categoryId) {
  fetch(`http://localhost:3000/api/foods?category_id=${categoryId}`)
    .then(res => res.json())
    .then(data => renderFoodList(data))
    .catch(err => {
      foodList.innerHTML = '<p style="color:red;">Lỗi tải dữ liệu.</p>';
      console.error(err);
    });
}

function searchFoods(keyword) {
  fetch(`http://localhost:3000/api/foods/search?keyword=${encodeURIComponent(keyword)}`)
    .then(res => res.json())
    .then(data => renderFoodList(data))
    .catch(err => {
      foodList.innerHTML = '<p style="color:red;">Lỗi tìm kiếm.</p>';
      console.error(err);
    });
}

function showDetailModal(food) {
  modalImg.src = food.image_url;
  modalName.textContent = food.name;
  modalDescription.textContent = food.description || '';
  modalPrice.textContent = formatPrice(food.price);
  modalIcon.textContent = categoryIcons[food.category_id] || '';
  modalAdd.onclick = () => addToCart({
  id: food.id,
  name: food.name,
  price: food.price
});
  modal.classList.remove("hidden");
}

function addToCart(food) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const found = cart.find(item => item.id === food.id);
  if (found) {
    found.quantity++;
  } else {
    cart.push({
      id: food.id,
      name: food.name,
      price: food.price,
      quantity: 1
    });
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  alert("🛒 Đã thêm vào giỏ!");
}

document.getElementById("modal-close")?.addEventListener("click", () => {
  modal.classList.add("hidden");
});

window.onclick = (e) => {
  if (e.target === modal) {
    modal.classList.add("hidden");
  }
};

// 👉 Load dữ liệu khi vào trang
if (keyword) {
  searchFoods(keyword);
} else if (categoryId) {
  loadFoods(categoryId);
} else {
  foodList.innerHTML = "<p style='padding:20px;'>Không tìm thấy món ăn.</p>";
}
