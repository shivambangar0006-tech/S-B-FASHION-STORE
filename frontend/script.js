nst API_URL = "https://s-b-fashion-store.onrender.com/api/products";

let products = [];
let cart = 0;

const money = n => "₹" + Number(n).toLocaleString("en-IN");

function getIcon(category) {
  const icons = {
    Men: "👕",
    Women: "👚",
    Shoes: "👟",
    Accessories: "👜"
  };

  return icons[category] || "🛍️";
}

function card(p) {
  const price = p.sale_price || p.price;

  return `<article class="product-card">
    <button class="heart" onclick="wishlist('${p.name}')">♡</button>

    <div class="product-image">
      <span>${getIcon(p.category)}</span>
    </div>

    <div class="product-info">
      <h3>${p.name}</h3>

      <div class="product-meta">
        <span>${p.category}</span>
        <strong>${money(price)}</strong>
      </div>

      <button class="btn btn-dark" onclick="addToCart('${p.name}')">
        Add to bag
      </button>
    </div>
  </article>`;
}

function render(list, target) {
  const element = document.getElementById(target);

  if (!element) return;

  element.innerHTML = list.map(card).join("");
}

async function loadProducts() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Unable to load products");
    }

    const data = await response.json();

    products = data.products || [];

    render(products.slice(0, 4), "productGrid");
    render(products, "shopGrid");

  } catch (error) {
    console.error("Product loading error:", error);

    toast("Unable to load products right now.");
  }
}

loadProducts();

document.getElementById("categoryFilter").addEventListener("change", e => {
  const value = e.target.value;

  render(
    value === "All"
      ? products
      : products.filter(p => p.category === value),
    "shopGrid"
  );
});

document.getElementById("searchBtn").onclick = () => {
  document.getElementById("searchPanel").classList.add("open");
  document.getElementById("searchInput").focus();
};

document.getElementById("closeSearch").onclick = () => {
  document.getElementById("searchPanel").classList.remove("open");
};

document.getElementById("searchInput").addEventListener("input", e => {
  const q = e.target.value.toLowerCase().trim();

  render(
    products.filter(p =>
      (p.name + " " + p.category + " " + (p.description || ""))
        .toLowerCase()
        .includes(q)
    ),
    "shopGrid"
  );
});

document.getElementById("cartBtn").onclick = () => {
  toast(
    cart
      ? `Your bag has ${cart} item${cart > 1 ? "s" : ""}.`
      : "Your bag is empty — add a product first."
  );
};

document.getElementById("wishlistBtn").onclick = () => {
  toast("Wishlist UI is ready; account storage will be connected later.");
};

document.getElementById("lookBtn").onclick = () => {
  toast("Build Your Look will be connected to outfit selection in the next frontend stage.");
};

function addToCart(name) {
  cart++;

  document.getElementById("cartCount").textContent = cart;

  toast(`${name} added to your bag.`);
}

function wishlist(name) {
  toast(`${name} saved to wishlist.`);
}

function toast(message) {
  const el = document.getElementById("toast");

  if (!el) return;

  el.textContent = message;
  el.classList.add("show");

  clearTimeout(window.toastTimer);

  window.toastTimer = setTimeout(() => {
    el.classList.remove("show");
  }, 2200);
}
