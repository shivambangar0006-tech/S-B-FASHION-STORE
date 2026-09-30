const API_URL = "https://s-b-fashion-store.onrender.com/api/products";

let products = [];
let cart = 0;

const money = n => "₹" + Number(n).toLocaleString("en-IN");

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getIcon(category) {
  const icons = {
    Men: "👕",
    Women: "👚",
    Shoes: "👟",
    Accessories: "👜"
  };

  return icons[category] || "🛍️";
}

function getImageUrl(imageUrl) {
  if (!imageUrl) {
    return "";
  }

  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://")
  ) {
    return imageUrl;
  }

  return imageUrl.startsWith("/")
    ? imageUrl
    : "/" + imageUrl;
}


/* =========================
   PRODUCT CARD
========================= */

function card(product) {
  const price =
    product.sale_price !== null &&
    product.sale_price !== undefined
      ? product.sale_price
      : product.price;

  const imageUrl = getImageUrl(product.image_url);

  return `
    <article
      class="product-card"
      data-product-id="${product.id}"
      style="cursor:pointer;"
    >

      <button
        class="heart"
        data-wishlist="${product.id}"
        aria-label="Add ${escapeHtml(product.name)} to wishlist"
      >
        ♡
      </button>

      <div class="product-image">

        ${
          imageUrl
            ? `
              <img
                src="${escapeHtml(imageUrl)}"
                alt="${escapeHtml(product.name)}"
                loading="lazy"
                onerror="
                  this.style.display='none';
                  this.nextElementSibling.style.display='block';
                "
              >

              <span style="display:none;">
                ${getIcon(product.category)}
              </span>
            `
            : `
              <span>
                ${getIcon(product.category)}
              </span>
            `
        }

      </div>

      <div class="product-info">

        <h3>${escapeHtml(product.name)}</h3>

        <div class="product-meta">
          <span>${escapeHtml(product.category)}</span>
          <strong>${money(price)}</strong>
        </div>

        <button
          class="btn btn-dark"
          data-add-cart="${product.id}"
        >
          Add to bag
        </button>

      </div>

    </article>
  `;
}


/* =========================
   RENDER PRODUCTS
========================= */

function render(list, target) {
  const element = document.getElementById(target);

  if (!element) {
    return;
  }

  element.innerHTML = list.map(card).join("");
}


/* =========================
   LOAD PRODUCTS
========================= */

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


/* =========================
   PRODUCT DETAILS
========================= */

async function openProduct(productId) {
  try {
    const response = await fetch(`${API_URL}/${productId}`);

    if (!response.ok) {
      throw new Error("Unable to load product");
    }

    const data = await response.json();

    showProductModal(data.product);

  } catch (error) {
    console.error("Product details error:", error);
    toast("Unable to open product details.");
  }
}


function showProductModal(product) {
  closeProductModal();

  const price =
    product.sale_price !== null &&
    product.sale_price !== undefined
      ? product.sale_price
      : product.price;

  const imageUrl = getImageUrl(product.image_url);

  const variants = product.variants || [];

  const sizes = [
    ...new Set(
      variants
        .map(variant => variant.size)
        .filter(Boolean)
    )
  ];

  const colors = [
    ...new Set(
      variants
        .map(variant => variant.color)
        .filter(Boolean)
    )
  ];

  const totalStock = variants.reduce(
    (total, variant) => total + Number(variant.stock || 0),
    0
  );

  const modal = document.createElement("div");

  modal.id = "productModal";

  modal.innerHTML = `
    <div class="product-modal-overlay">

      <div class="product-modal">

        <button
          class="product-modal-close"
          id="closeProductModal"
          aria-label="Close product details"
        >
          ×
        </button>

        <div class="product-detail-image">

          ${
            imageUrl
              ? `
                <img
                  src="${escapeHtml(imageUrl)}"
                  alt="${escapeHtml(product.name)}"
                >
              `
              : `
                <span>
                  ${getIcon(product.category)}
                </span>
              `
          }

        </div>

        <div class="product-detail-content">

          <span class="product-detail-category">
            ${escapeHtml(product.category)}
          </span>

          <h2>
            ${escapeHtml(product.name)}
          </h2>

          <div class="product-detail-price">
            ${money(price)}
          </div>

          ${
            product.sale_price !== null &&
            product.sale_price !== undefined
              ? `
                <div class="product-detail-original">
                  ${money(product.price)}
                </div>
              `
              : ""
          }

          <p class="product-detail-description">
            ${
              escapeHtml(
                product.description ||
                "A carefully selected piece from the S&B Fashion Store collection."
              )
            }
          </p>

          ${
            sizes.length > 0
              ? `
                <div class="detail-option">
                  <label>Size</label>

                  <div class="option-buttons" id="sizeOptions">
                    ${sizes
                      .map(
                        (size, index) => `
                          <button
                            class="option-btn ${index === 0 ? "selected" : ""}"
                            data-size="${escapeHtml(size)}"
                          >
                            ${escapeHtml(size)}
                          </button>
                        `
                      )
                      .join("")}
                  </div>
                </div>
              `
              : ""
          }

          ${
            colors.length > 0
              ? `
                <div class="detail-option">
                  <label>Color</label>

                  <div class="option-buttons" id="colorOptions">
                    ${colors
                      .map(
                        (color, index) => `
                          <button
                            class="option-btn ${index === 0 ? "selected" : ""}"
                            data-color="${escapeHtml(color)}"
                          >
                            ${escapeHtml(color)}
                          </button>
                        `
                      )
                      .join("")}
                  </div>
                </div>
              `
              : ""
          }

          <div class="product-stock">
            ${
              totalStock > 0
                ? `In stock`
                : `Out of stock`
            }
          </div>

          <button
            class="btn btn-dark product-detail-add"
            id="detailAddToCart"
            ${totalStock <= 0 ? "disabled" : ""}
          >
            ${
              totalStock > 0
                ? "Add to bag"
                : "Out of stock"
            }
          </button>

        </div>

      </div>

    </div>
  `;

  document.body.appendChild(modal);

  addProductModalStyles();

  document
    .getElementById("closeProductModal")
    ?.addEventListener("click", closeProductModal);

  modal
    .querySelector(".product-modal-overlay")
    ?.addEventListener("click", event => {
      if (event.target.classList.contains("product-modal-overlay")) {
        closeProductModal();
      }
    });

  modal
    .querySelectorAll(".option-btn")
    .forEach(button => {
      button.addEventListener("click", () => {

        const group = button.parentElement;

        group
          .querySelectorAll(".option-btn")
          .forEach(item => {
            item.classList.remove("selected");
          });

        button.classList.add("selected");
      });
    });

  document
    .getElementById("detailAddToCart")
    ?.addEventListener("click", () => {

      const selectedSize =
        modal.querySelector(".option-btn[data-size].selected")
          ?.dataset.size || null;

      const selectedColor =
        modal.querySelector(".option-btn[data-color].selected")
          ?.dataset.color || null;

      cart++;

      const cartCount =
        document.getElementById("cartCount");

      if (cartCount) {
        cartCount.textContent = cart;
      }

      let message = `${product.name} added to your bag.`;

      if (selectedSize) {
        message += ` Size: ${selectedSize}.`;
      }

      if (selectedColor) {
        message += ` Color: ${selectedColor}.`;
      }

      closeProductModal();
      toast(message);
    });
}


function closeProductModal() {
  const modal = document.getElementById("productModal");

  if (modal) {
    modal.remove();
  }
}


/* =========================
   PRODUCT MODAL STYLES
========================= */

function addProductModalStyles() {

  if (document.getElementById("productModalStyles")) {
    return;
  }

  const style = document.createElement("style");

  style.id = "productModalStyles";

  style.textContent = `
    .product-modal-overlay {
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: rgba(0, 0, 0, 0.65);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 18px;
      overflow-y: auto;
    }

    .product-modal {
      position: relative;
      width: min(900px, 100%);
      max-height: 94vh;
      overflow-y: auto;
      background: #ffffff;
      border-radius: 18px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
    }

    .product-modal-close {
      position: absolute;
      top: 12px;
      right: 12px;
      z-index: 5;
      width: 38px;
      height: 38px;
      border: none;
      border-radius: 50%;
      background: #ffffff;
      font-size: 28px;
      line-height: 1;
      cursor: pointer;
      box-shadow: 0 3px 12px rgba(0, 0, 0, 0.15);
    }

    .product-detail-image {
      min-height: 430px;
      background: #f4f3ef;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .product-detail-image img {
      width: 100%;
      height: 100%;
      min-height: 430px;
      object-fit: cover;
      display: block;
    }

    .product-detail-image span {
      font-size: 90px;
    }

    .product-detail-content {
      padding: 42px 34px 34px;
    }

    .product-detail-category {
      display: block;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      color: #777;
      margin-bottom: 10px;
    }

    .product-detail-content h2 {
      margin: 0 0 12px;
      font-size: 30px;
      line-height: 1.15;
    }

    .product-detail-price {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 4px;
    }

    .product-detail-original {
      color: #888;
      text-decoration: line-through;
      margin-bottom: 18px;
    }

    .product-detail-description {
      color: #555;
      line-height: 1.7;
      margin: 18px 0 24px;
    }

    .detail-option {
      margin-bottom: 20px;
    }

    .detail-option label {
      display: block;
      font-weight: 700;
      margin-bottom: 10px;
    }

    .option-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .option-btn {
      border: 1px solid #ccc;
      background: #fff;
      padding: 9px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
    }

    .option-btn.selected {
      background: #111;
      color: #fff;
      border-color: #111;
    }

    .product-stock {
      font-size: 14px;
      font-weight: 600;
      margin: 8px 0 18px;
    }

    .product-detail-add {
      width: 100%;
      padding: 14px 18px;
    }

    .product-detail-add:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    @media (max-width: 700px) {

      .product-modal-overlay {
        padding: 10px;
        align-items: flex-start;
      }

      .product-modal {
        grid-template-columns: 1fr;
        max-height: 96vh;
        margin: 10px 0;
      }

      .product-detail-image {
        min-height: 280px;
      }

      .product-detail-image img {
        min-height: 280px;
        max-height: 360px;
      }

      .product-detail-content {
        padding: 28px 22px 24px;
      }

      .product-detail-content h2 {
        font-size: 25px;
      }
    }
  `;

  document.head.appendChild(style);
}


/* =========================
   CARD EVENTS
========================= */

function setupProductEvents() {

  document.addEventListener("click", event => {

    const addButton =
      event.target.closest("[data-add-cart]");

    if (addButton) {
      event.stopPropagation();

      const productId =
        Number(addButton.dataset.addCart);

      const product =
        products.find(item => item.id === productId);

      if (product) {
        addToCart(product.name);
      }

      return;
    }

    const wishlistButton =
      event.target.closest("[data-wishlist]");

    if (wishlistButton) {
      event.stopPropagation();

      const productId =
        Number(wishlistButton.dataset.wishlist);

      const product =
        products.find(item => item.id === productId);

      if (product) {
        wishlist(product.name);
      }

      return;
    }

    const productCard =
      event.target.closest("[data-product-id]");

    if (productCard) {
      const productId =
        Number(productCard.dataset.productId);

      openProduct(productId);
    }

  });
}


/* =========================
   CATEGORY FILTER
========================= */

function setupCategoryFilter() {

  const categoryFilter =
    document.getElementById("categoryFilter");

  if (!categoryFilter) {
    return;
  }

  categoryFilter.addEventListener("change", event => {

    const value = event.target.value;

    const filteredProducts =
      value === "All"
        ? products
        : products.filter(
            product => product.category === value
          );

    render(filteredProducts, "shopGrid");
  });
}


/* =========================
   SEARCH
========================= */

function setupSearch() {

  const searchBtn =
    document.getElementById("searchBtn");

  const closeSearch =
    document.getElementById("closeSearch");

  const searchInput =
    document.getElementById("searchInput");

  const searchPanel =
    document.getElementById("searchPanel");

  if (
    searchBtn &&
    searchPanel &&
    searchInput
  ) {
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

    searchInput.addEventListener(
      "input",
      event => {

        const query =
          event.target.value
            .toLowerCase()
            .trim();

        const filteredProducts =
          products.filter(product =>
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
      }
    );
  }
}


/* =========================
   CART
========================= */

function setupCart() {

  const cartBtn =
    document.getElementById("cartBtn");

  if (!cartBtn) {
    return;
  }

  cartBtn.onclick = () => {

    if (cart > 0) {
      toast(
        `Your bag has ${cart} item${
          cart > 1 ? "s" : ""
        }.`
      );
    } else {
      toast(
        "Your bag is empty — add a product first."
      );
    }
  };
}


function addToCart(name) {

  cart++;

  const cartCount =
    document.getElementById("cartCount");

  if (cartCount) {
    cartCount.textContent = cart;
  }

  toast(`${name} added to your bag.`);
}


/* =========================
   WISHLIST
========================= */

function setupWishlist() {

  const wishlistBtn =
    document.getElementById("wishlistBtn");

  if (!wishlistBtn) {
    return;
  }

  wishlistBtn.onclick = () => {

    toast(
      "Wishlist UI is ready; account storage will be connected later."
    );
  };
}


function wishlist(name) {
  toast(`${name} saved to wishlist.`);
}


/* =========================
   BUILD YOUR LOOK
========================= */

function setupBuildYourLook() {

  const lookBtn =
    document.getElementById("lookBtn");

  if (!lookBtn) {
    return;
  }

  lookBtn.onclick = () => {

    toast(
      "Build Your Look will be connected to outfit selection in the next frontend stage."
    );
  };
}


/* =========================
   TOAST
========================= */

function toast(message) {

  const element =
    document.getElementById("toast");

  if (!element) {
    return;
  }

  element.textContent = message;

  element.classList.add("show");

  clearTimeout(window.toastTimer);

  window.toastTimer =
    setTimeout(() => {
      element.classList.remove("show");
    }, 2200);
}


/* =========================
   START APP
========================= */

setupProductEvents();
setupCategoryFilter();
setupSearch();
setupCart();
setupWishlist();
setupBuildYourLook();

loadProducts();
