document.addEventListener("DOMContentLoaded", async () => {
  const categoryContainer = document.getElementById("category-list");
  const searchInput = document.getElementById("search-input");
  const suggestList = document.getElementById("suggest-list");
  const popularFoods = document.getElementById("popular-foods");
  const comboList = document.getElementById("combo-list");

  // 🟧 Danh sách danh mục cố định
  const categories = [
    { id: 1, name: '🍕 Pizza', img: 'https://res.cloudinary.com/dacnobglx/image/upload/v1745028078/cat1_sg5wwo.png' },
    { id: 2, name: '🍔 Hamburger', img: 'https://res.cloudinary.com/dacnobglx/image/upload/v1745028078/cat2_oeoxas.png' },
    { id: 3, name: '🥤 Đồ uống', img: 'https://res.cloudinary.com/dacnobglx/image/upload/v1745028078/cat7_ukwqbi.png' },
    { id: 4, name: '🌭 Hotdog', img: 'https://res.cloudinary.com/dacnobglx/image/upload/v1745028078/cat6_s9txhu.png' },
    { id: 5, name: '🍗 Gà', img: 'https://res.cloudinary.com/dacnobglx/image/upload/v1745028078/cat3_sgqee1.png' },
    { id: 6, name: '🍜 Mì', img: 'https://res.cloudinary.com/dacnobglx/image/upload/v1745028078/cat4_pronke.png' },
    { id: 7, name: '🍚 Cơm', img: 'https://res.cloudinary.com/dacnobglx/image/upload/v1745028078/cat8_bio6ym.png' },
    { id: 8, name: '🍟 Ăn vặt', img: 'https://res.cloudinary.com/dacnobglx/image/upload/v1745028078/cat5_fyhqvy.png' },
    { id: 9, name: '🍰 Tráng miệng', img: 'https://res.cloudinary.com/dacnobglx/image/upload/v1745028078/cat9_nv5sya.png' }
  ];

  // 🟨 Hiển thị danh mục
  categories.forEach(cat => {
    const div = document.createElement("div");
    div.className = "category-item flex flex-col items-center p-2 bg-orange-50 rounded-lg cursor-pointer";
    div.innerHTML = `
      <img src="${cat.img}" alt="${cat.name}" class="w-20 h-20 object-cover rounded-full border-2 border-orange-400 shadow" />
      <span class="mt-2 text-sm font-semibold text-orange-800">${cat.name}</span>
    `;
    div.addEventListener("click", () => {
      window.location.href = `menu.html?category=${cat.id}`;
    });
    categoryContainer.appendChild(div);
  });

  // 🔍 Tìm kiếm món
  window.handleSearch = () => {
    const keyword = searchInput.value.trim();
    if (keyword) {
      window.location.href = `menu.html?search=${encodeURIComponent(keyword)}`;
    }
  };

  // 🟩 Gợi ý theo thời gian (sáng/trưa/tối)
  async function loadSuggestions() {
    const hour = new Date().getHours();
    let time = "trua";
    if (hour < 10) time = "sang";
    else if (hour >= 17) time = "toi";

    try {
      const res = await fetch(`http://localhost:3000/api/foods/suggest?time=${time}`);
      const foods = await res.json();
      renderFoods(suggestList, foods);
    } catch (err) {
      console.error("Lỗi gợi ý:", err);
    }
  }

  // 🔥 Món bán chạy
  async function loadPopular() {
    try {
      const res = await fetch("http://localhost:3000/api/foods/popular");
      const foods = await res.json();
      renderFoods(popularFoods, foods);
    } catch (err) {
      console.error("Lỗi món bán chạy:", err);
    }
  }

  // 🎁 Combo tiết kiệm
  async function loadCombos() {
    try {
      const res = await fetch("http://localhost:3000/api/foods/combos");
      const foods = await res.json();
      renderFoods(comboList, foods);
    } catch (err) {
      console.error("Lỗi combo:", err);
    }
  }

  // 🧊 Hiển thị danh sách món ăn (gợi ý / hot / combo)
  function renderFoods(container, foods) {
    container.innerHTML = "";
    if (!foods || foods.length === 0) {
      container.innerHTML = `<p class="text-red-500 col-span-full">Không có món ăn nào.</p>`;
      return;
    }

    foods.forEach(food => {
      const imgSrc = food.image_url || food.img || "https://via.placeholder.com/150";
      const div = document.createElement("div");
      div.className = "food-card p-3 bg-white rounded shadow hover:shadow-md transition";
      div.innerHTML = `
        <img src="${imgSrc}" alt="${food.name}" class="w-full h-40 object-cover mb-2 rounded" />
        <h3 class="font-semibold truncate">${food.name}</h3>
        <p class="text-orange-600 font-bold">${formatPrice(food.price)}₫</p>
        <button class="add-to-cart-btn mt-2 w-full bg-orange-500 text-white rounded px-2 py-1 hover:bg-orange-600"
          data-id="${food.id}"
          data-name="${food.name}"
          data-price="${food.price}">
          Thêm vào giỏ
        </button>
      `;
      div.querySelector(".add-to-cart-btn").addEventListener("click", (e) => {
        const btn = e.currentTarget;
        const foodItem = {
          id: parseInt(btn.dataset.id),
          name: btn.dataset.name,
          price: parseInt(btn.dataset.price)
        };
        addToCart(foodItem);
      });
      container.appendChild(div);
    });
  }

  function formatPrice(price) {
    return Number(price).toLocaleString("vi-VN");
  }

  // 🛒 Thêm vào giỏ
  function addToCart(food) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
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
  localStorage.setItem("cart", JSON.stringify(cart));
  alert("🛒 Đã thêm vào giỏ!");
}

  window.logout = () => {
    localStorage.clear();
    window.location.href = "login.html";
  };

  // 🟦 Gọi hàm chính
  loadSuggestions();
  loadPopular();
  loadCombos();
});
