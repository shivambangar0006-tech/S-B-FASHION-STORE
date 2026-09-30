const API_URL = "https://s-b-fashion-store.onrender.com/api/products";

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

function getImageUrl(imageUrl, category) {
  if (!imageUrl) {
    return "";
  }

  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  return imageUrl.startsWith("/")
    ? imageUrl
    : "/" + imageUrl;
}

function card(p) {
  const price = p.sale_price !== null && p.sale_price !== undefined
    ? p.sale_price
    : p.price;

  const imageUrl = getImageUrl(p.image_url, p.category);

  return `
    <article class="product-card">

      <button
        class="heart"
        onclick="wishlist('${p.name.replace(/'/g, "\\'")}')"
        aria-label="Add ${p.name} to wishlist"
      >
        ♡
      </button>

      <div class="product-image">

        ${
          imageUrl
            ? `
              <img
                src="${imageUrl}"
                alt="${p.name}"
                loading="lazy"
                onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
              >
              <span style="display:none;">${getIcon(p.category)}</span>
            `
            : `
              <span>${getIcon(p.category)}</span>
            `
        }

      </div>

      <div class="product-info">

        <h3>${p.name}</h3>

        <div class="product-meta">
          <span>${p.category}</span>
          <strong>${money(price)}</strong>
        </div>

        <button
          class="btn btn-dark"
          onclick="addToCart('${p.name.replace(/'/g, "\\'")}')"
        >
          Add to bag
        </button>

      </div>

    </article>
  `;
}

function render(list, target) {
  const element = document.getElementById(target);

  if (!element) {
    return;
  }

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

function setupCategoryFilter() {
  const categoryFilter = document.getElementById("categoryFilter");

  if (!categoryFilter) {
    return;
  }

  categoryFilter.addEventListener("change", event => {
    const value = event.target.value;

    const filteredProducts =
      value === "All"
        ? products
        : products.filter(product => product.category === value);

    render(filteredProducts, "shopGrid");
  });
}

function setupSearch() {
  const searchBtn = document.getElementById("searchBtn");
  const closeSearch = document.getElementById("closeSearch");
  const searchInput = document.getElementById("searchInput");
  const searchPanel = document.getElementById("searchPanel");

  if (searchBtn && searchPanel && searchInput) {
    searchBtn.onclick = () => {
      searchPanel.classList.add("open");
      searchInput.focus();
    };
  }

  if (closeSearch && searchPanel) {
    closeSearch.onclick = () => {
      searchPanel.classList.remove("open");
    };
  }

  if (searchInput) {
    searchInput.addEventListener("input", event => {
      const query = event.target.value.toLowerCase().trim();

      const filteredProducts = products.filter(product =>
        (
          product.name +
          " " +
          product.category +
          " " +
          (product.description || "")
        )
          .toLowerCase()
          .includes(query)
      );

      render(filteredProducts, "shopGrid");
    });
  }
}

function setupCart() {
  const cartBtn = document.getElementById("cartBtn");

  if (!cartBtn) {
    return;
  }

  cartBtn.onclick = () => {
    if (cart > 0) {
      toast(
        `Your bag has ${cart} item${cart > 1 ? "s" : ""}.`
      );
    } else {
      toast("Your bag is empty — add a product first.");
    }
  };
}

function setupWishlist() {
  const wishlistBtn = document.getElementById("wishlistBtn");

  if (!wishlistBtn) {
    return;
  }

  wishlistBtn.onclick = () => {
    toast(
      "Wishlist UI is ready; account storage will be connected later."
    );
  };
}

function setupBuildYourLook() {
  const lookBtn = document.getElementById("lookBtn");

  if (!lookBtn) {
    return;
  }

  lookBtn.onclick = () => {
    toast(
      "Build Your Look will be connected to outfit selection in the next frontend stage."
    );
  };
}

function addToCart(name) {
  cart++;

  const cartCount = document.getElementById("cartCount");

  if (cartCount) {
    cartCount.textContent = cart;
  }

  toast(`${name} added to your bag.`);
}

function wishlist(name) {
  toast(`${name} saved to wishlist.`);
}

function toast(message) {
  const element = document.getElementById("toast");

  if (!element) {
    return;
  }

  element.textContent = message;
  element.classList.add("show");

  clearTimeout(window.toastTimer);

  window.toastTimer = setTimeout(() => {
    element.classList.remove("show");
  }, 2200);
}

setupCategoryFilter();
setupSearch();
setupCart();
setupWishlist();
setupBuildYourLook();

loadProducts();
