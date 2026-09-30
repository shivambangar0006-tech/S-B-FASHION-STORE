const API_URL = "https://s-b-fashion-store.onrender.com/api/products";

let products = [];
let cartItems = JSON.parse(localStorage.getItem("sbCart") || "[]");


/* =========================
   BASIC HELPERS
========================= */

const money = value =>
  "₹" + Number(value || 0).toLocaleString("en-IN");

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
  if (!imageUrl) return "";

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

  if (!element) return;

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

    updateCartCount();

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
    const response = await fetch(
      `${API_URL}/${productId}`
    );

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
    (total, variant) =>
      total + Number(variant.stock || 0),
    0
  );

  const defaultSize = sizes[0] || "";
  const defaultColor = colors[0] || "";

  const modal = document.createElement("div");

  modal.id = "productModal";

  modal.innerHTML = `
    <div class="product-modal-overlay">

      <div class="product-modal">

        <button
          class="product-modal-close"
          id="closeProductModal"
          aria-label="Close product"
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

                  <div class="option-buttons">

                    ${sizes
                      .map(
                        (size, index) => `
                          <button
                            class="option-btn ${
                              index === 0
                                ? "selected"
                                : ""
                            }"
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

                  <div class="option-buttons">

                    ${colors
                      .map(
                        (color, index) => `
                          <button
                            class="option-btn ${
                              index === 0
                                ? "selected"
                                : ""
                            }"
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

          ${
            totalStock > 0
              ? `
                <div class="quantity-section">

                  <label>Quantity</label>

                  <div class="quantity-selector">

                    <button
                      id="detailQuantityMinus"
                      type="button"
                    >
                      −
                    </button>

                    <span id="detailQuantity">
                      1
                    </span>

                    <button
                      id="detailQuantityPlus"
                      type="button"
                    >
                      +
                    </button>

                  </div>

                  <small id="quantityMessage">
                    Maximum ${totalStock} available
                  </small>

                </div>
              `
              : ""
          }

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


  /* CLOSE BUTTON */

  document
    .getElementById("closeProductModal")
    ?.addEventListener(
      "click",
      closeProductModal
    );


  /* CLOSE WHEN CLICKING OUTSIDE */

  modal
    .querySelector(".product-modal-overlay")
    ?.addEventListener("click", event => {

      if (
        event.target.classList.contains(
          "product-modal-overlay"
        )
      ) {
        closeProductModal();
      }

    });


  /* SIZE / COLOR BUTTONS */

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


  /* QUANTITY */

  let quantity = 1;

  const quantityDisplay =
    document.getElementById(
      "detailQuantity"
    );

  const minusButton =
    document.getElementById(
      "detailQuantityMinus"
    );

  const plusButton =
    document.getElementById(
      "detailQuantityPlus"
    );


  if (minusButton) {

    minusButton.addEventListener(
      "click",
      () => {

        if (quantity > 1) {

          quantity--;

          quantityDisplay.textContent =
            quantity;

        }

      }
    );

  }


  if (plusButton) {

    plusButton.addEventListener(
      "click",
      () => {

        if (quantity < totalStock) {

          quantity++;

          quantityDisplay.textContent =
            quantity;

        } else {

          toast(
            `Only ${totalStock} available.`
          );

        }

      }
    );

  }


  /* ADD TO BAG */

  document
    .getElementById("detailAddToCart")
    ?.addEventListener("click", () => {

      const selectedSize =
        modal.querySelector(
          ".option-btn[data-size].selected"
        )?.dataset.size || defaultSize;

      const selectedColor =
        modal.querySelector(
          ".option-btn[data-color].selected"
        )?.dataset.color || defaultColor;

      addProductToCart(
        product,
        selectedSize,
        selectedColor,
        quantity
      );

      closeProductModal();

    });
}


function closeProductModal() {

  const modal =
    document.getElementById(
      "productModal"
    );

  if (modal) {
    modal.remove();
  }
}


/* =========================
   PRODUCT MODAL STYLES
========================= */

function addProductModalStyles() {

  if (
    document.getElementById(
      "productModalStyles"
    )
  ) {
    return;
  }

  const style =
    document.createElement("style");

  style.id =
    "productModalStyles";

  style.textContent = `

    .product-modal-overlay {
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: rgba(0,0,0,0.65);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 18px;
      overflow-y: auto;
    }

    .product-modal {
      position: relative;
      width: min(900px,100%);
      max-height: 94vh;
      overflow-y: auto;
      background: #fff;
      border-radius: 18px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      box-shadow:
        0 20px 60px rgba(0,0,0,0.25);
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
      background: #fff;
      font-size: 28px;
      line-height: 1;
      cursor: pointer;
      box-shadow:
        0 3px 12px rgba(0,0,0,0.15);
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

    .detail-option label,
    .quantity-section label {
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
      margin: 8px 0 20px;
    }

    .quantity-section {
      margin-bottom: 22px;
    }

    .quantity-selector {
      display: inline-flex;
      align-items: center;
      border: 1px solid #ccc;
      border-radius: 7px;
      overflow: hidden;
    }

    .quantity-selector button {
      width: 42px;
      height: 42px;
      border: none;
      background: #fff;
      cursor: pointer;
      font-size: 22px;
    }

    .quantity-selector span {
      min-width: 45px;
      text-align: center;
      font-weight: 700;
    }

    .quantity-section small {
      display: block;
      margin-top: 7px;
      color: #777;
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
   ADD PRODUCT TO CART
========================= */

function addProductToCart(
  product,
  size = "",
  color = "",
  quantity = 1
) {

  const price =
    product.sale_price !== null &&
    product.sale_price !== undefined
      ? Number(product.sale_price)
      : Number(product.price);

  const existingItem =
    cartItems.find(item =>
      item.productId === product.id &&
      item.size === size &&
      item.color === color
    );

  if (existingItem) {

    existingItem.quantity += quantity;

  } else {

    cartItems.push({
      productId: product.id,
      name: product.name,
      price: price,
      imageUrl: product.image_url,
      size: size,
      color: color,
      quantity: quantity
    });

  }

  saveCart();

  updateCartCount();

  toast(
    `${product.name} × ${quantity} added to your bag.`
  );
}


/* =========================
   SAVE CART
========================= */

function saveCart() {

  localStorage.setItem(
    "sbCart",
    JSON.stringify(cartItems)
  );

}


/* =========================
   CART COUNT
========================= */

function updateCartCount() {

  const count =
    cartItems.reduce(
      (total, item) =>
        total + Number(item.quantity),
      0
    );

  const cartCount =
    document.getElementById(
      "cartCount"
    );

  if (cartCount) {
    cartCount.textContent = count;
  }

}


/* =========================
   CART
========================= */

function openCart() {

  closeCart();

  const panel =
    document.createElement("div");

  panel.id = "cartPanel";

  panel.innerHTML = `
    <div class="cart-overlay">

      <aside class="cart-drawer">

        <div class="cart-header">

          <h2>Your Bag</h2>

          <button
            id="closeCart"
            class="cart-close"
          >
            ×
          </button>

        </div>

        <div
          id="cartContent"
          class="cart-content"
        ></div>

      </aside>

    </div>
  `;

  document.body.appendChild(panel);

  addCartStyles();

  renderCart();

  document
    .getElementById("closeCart")
    ?.addEventListener(
      "click",
      closeCart
    );

  panel
    .querySelector(".cart-overlay")
    ?.addEventListener("click", event => {

      if (
        event.target.classList.contains(
          "cart-overlay"
        )
      ) {
        closeCart();
      }

    });

}


function closeCart() {

  const panel =
    document.getElementById(
      "cartPanel"
    );

  if (panel) {
    panel.remove();
  }

}


/* =========================
   RENDER CART
========================= */

function renderCart() {

  const content =
    document.getElementById(
      "cartContent"
    );

  if (!content) return;


  if (cartItems.length === 0) {

    content.innerHTML = `
      <div class="empty-cart">

        <div class="empty-cart-icon">
          🛍️
        </div>

        <h3>Your bag is empty</h3>

        <p>
          Add something you love and
          it will appear here.
        </p>

      </div>
    `;

    return;
  }


  const subtotal =
    cartItems.reduce(
      (total, item) =>
        total +
        Number(item.price) *
        Number(item.quantity),
      0
    );


  content.innerHTML = `

    <div class="cart-items">

      ${cartItems
        .map((item, index) => {

          const imageUrl =
            getImageUrl(
              item.imageUrl
            );

          return `
            <div class="cart-item">

              <div class="cart-item-image">

                ${
                  imageUrl
                    ? `
                      <img
                        src="${escapeHtml(imageUrl)}"
                        alt="${escapeHtml(item.name)}"
                      >
                    `
                    : `
                      <span>
                        🛍️
                      </span>
                    `
                }

              </div>

              <div class="cart-item-details">

                <h3>
                  ${escapeHtml(item.name)}
                </h3>

                ${
                  item.size
                    ? `
                      <p>
                        Size:
                        ${escapeHtml(item.size)}
                      </p>
                    `
                    : ""
                }

                ${
                  item.color
                    ? `
                      <p>
                        Color:
                        ${escapeHtml(item.color)}
                      </p>
                    `
                    : ""
                }

                <strong>
                  ${money(item.price)}
                </strong>

                <div class="cart-item-actions">

                  <div class="quantity-control">

                    <button
                      data-cart-minus="${index}"
                    >
                      −
                    </button>

                    <span>
                      ${item.quantity}
                    </span>

                    <button
                      data-cart-plus="${index}"
                    >
                      +
                    </button>

                  </div>

                  <button
                    class="remove-cart-item"
                    data-cart-remove="${index}"
                  >
                    Remove
                  </button>

                </div>

              </div>

            </div>
          `;

        })
        .join("")}

    </div>

    <div class="cart-summary">

      <div class="cart-summary-row">

        <span>
          Subtotal
        </span>

        <strong>
          ${money(subtotal)}
        </strong>

      </div>

      <div class="cart-summary-row">

        <span>
          Shipping
        </span>

        <span>
          Calculated at checkout
        </span>

      </div>

      <button
        class="btn btn-dark cart-checkout"
        id="checkoutButton"
      >
        Proceed to checkout
      </button>

    </div>
  `;


  /* PLUS */

  content
    .querySelectorAll(
      "[data-cart-plus]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const index =
            Number(
              button.dataset.cartPlus
            );

          cartItems[index].quantity++;

          saveCart();

          updateCartCount();

          renderCart();

        }
      );

    });


  /* MINUS */

  content
    .querySelectorAll(
      "[data-cart-minus]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const index =
            Number(
              button.dataset.cartMinus
            );

          if (
            cartItems[index].quantity > 1
          ) {

            cartItems[index].quantity--;

          } else {

            cartItems.splice(
              index,
              1
            );

          }

          saveCart();

          updateCartCount();

          renderCart();

        }
      );

    });


  /* REMOVE */

  content
    .querySelectorAll(
      "[data-cart-remove]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const index =
            Number(
              button.dataset.cartRemove
            );

          cartItems.splice(
            index,
            1
          );

          saveCart();

          updateCartCount();

          renderCart();

        }
      );

    });


  /* CHECKOUT */

  document
    .getElementById(
      "checkoutButton"
    )
    ?.addEventListener(
      "click",
      () => {

        toast(
          "Checkout will be connected in the next shopping stage."
        );

      }
    );

}


/* =========================
   CART STYLES
========================= */

function addCartStyles() {

  if (
    document.getElementById(
      "cartStyles"
    )
  ) {
    return;
  }

  const style =
    document.createElement("style");

  style.id = "cartStyles";

  style.textContent = `

    .cart-overlay {
      position: fixed;
      inset: 0;
      z-index: 10000;
      background: rgba(0,0,0,0.55);
      display: flex;
      justify-content: flex-end;
    }

    .cart-drawer {
      width: min(460px,94%);
      height: 100%;
      background: #fff;
      display: flex;
      flex-direction: column;
      box-shadow:
        -10px 0 40px rgba(0,0,0,0.2);
    }

    .cart-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 22px;
      border-bottom: 1px solid #eee;
    }

    .cart-header h2 {
      margin: 0;
      font-size: 24px;
    }

    .cart-close {
      border: none;
      background: none;
      font-size: 30px;
      cursor: pointer;
    }

    .cart-content {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
    }

    .empty-cart {
      text-align: center;
      padding: 80px 20px;
      color: #666;
    }

    .empty-cart-icon {
      font-size: 60px;
      margin-bottom: 15px;
    }

    .empty-cart h3 {
      color: #111;
      margin-bottom: 8px;
    }

    .cart-item {
      display: flex;
      gap: 14px;
      padding: 0 0 18px;
      margin-bottom: 18px;
      border-bottom: 1px solid #eee;
    }

    .cart-item-image {
      width: 90px;
      height: 110px;
      flex-shrink: 0;
      background: #f4f3ef;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .cart-item-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .cart-item-image span {
      font-size: 30px;
    }

    .cart-item-details {
      flex: 1;
    }

    .cart-item-details h3 {
      margin: 0 0 7px;
      font-size: 16px;
    }

    .cart-item-details p {
      margin: 3px 0;
      font-size: 13px;
      color: #666;
    }

    .cart-item-details strong {
      display: block;
      margin-top: 8px;
    }

    .cart-item-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin-top: 12px;
    }

    .quantity-control {
      display: flex;
      align-items: center;
      border: 1px solid #ccc;
      border-radius: 5px;
      overflow: hidden;
    }

    .quantity-control button {
      width: 30px;
      height: 30px;
      border: none;
      background: #fff;
      cursor: pointer;
      font-size: 18px;
    }

    .quantity-control span {
      min-width: 28px;
      text-align: center;
      font-size: 14px;
    }

    .remove-cart-item {
      border: none;
      background: none;
      color: #777;
      text-decoration: underline;
      cursor: pointer;
      font-size: 13px;
    }

    .cart-summary {
      border-top: 1px solid #eee;
      padding: 20px;
    }

    .cart-summary-row {
      display: flex;
      justify-content: space-between;
      gap: 15px;
      margin-bottom: 12px;
      font-size: 14px;
    }

    .cart-checkout {
      width: 100%;
      margin-top: 12px;
      padding: 14px;
    }

  `;

  document.head.appendChild(style);
}


/* =========================
   PRODUCT EVENTS
========================= */

function setupProductEvents() {

  document.addEventListener(
    "click",
    event => {

      /* ADD TO BAG */

      const addButton =
        event.target.closest(
          "[data-add-cart]"
        );

      if (addButton) {

        event.stopPropagation();

        const productId =
          Number(
            addButton.dataset.addCart
          );

        const product =
          products.find(
            item =>
              item.id === productId
          );

        if (product) {

          addProductToCart(
            product,
            "",
            "",
            1
          );

        }

        return;
      }


      /* WISHLIST */

      const wishlistButton =
        event.target.closest(
          "[data-wishlist]"
        );

      if (wishlistButton) {

        event.stopPropagation();

        const productId =
          Number(
            wishlistButton.dataset.wishlist
          );

        const product =
          products.find(
            item =>
              item.id === productId
          );

        if (product) {
          wishlist(product.name);
        }

        return;
      }


      /* PRODUCT CARD */

      const productCard =
        event.target.closest(
          "[data-product-id]"
        );

      if (productCard) {

        const productId =
          Number(
            productCard.dataset.productId
          );

        openProduct(productId);

      }

    }
  );
}


/* =========================
   CATEGORY FILTER
========================= */

function setupCategoryFilter() {

  const categoryFilter =
    document.getElementById(
      "categoryFilter"
    );

  if (!categoryFilter) return;

  categoryFilter.addEventListener(
    "change",
    event => {

      const value =
        event.target.value;

      const filteredProducts =
        value === "All"
          ? products
          : products.filter(
              product =>
                product.category === value
            );

      render(
        filteredProducts,
        "shopGrid"
      );

    }
  );
}


/* =========================
   SEARCH
========================= */

function setupSearch() {

  const searchBtn =
    document.getElementById(
      "searchBtn"
    );

  const closeSearch =
    document.getElementById(
      "closeSearch"
    );

  const searchInput =
    document.getElementById(
      "searchInput"
    );

  const searchPanel =
    document.getElementById(
      "searchPanel"
    );


  if (
    searchBtn &&
    searchPanel &&
    searchInput
  ) {

    searchBtn.onclick = () => {

      searchPanel.classList.add(
        "open"
      );

      searchInput.focus();

    };

  }


  if (
    closeSearch &&
    searchPanel
  ) {

    closeSearch.onclick = () => {

      searchPanel.classList.remove(
        "open"
      );

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

        render(
          filteredProducts,
          "shopGrid"
        );

      }
    );

  }

}


/* =========================
   CART BUTTON
========================= */

function setupCart() {

  const cartBtn =
    document.getElementById(
      "cartBtn"
    );

  if (!cartBtn) return;

  cartBtn.onclick = () => {

    openCart();

  };

}


/* =========================
   WISHLIST BUTTON
========================= */

function setupWishlist() {

  const wishlistBtn =
    document.getElementById(
      "wishlistBtn"
    );

  if (!wishlistBtn) return;

  wishlistBtn.onclick = () => {

    toast(
      "Wishlist storage will be connected with customer accounts later."
    );

  };

}


function wishlist(name) {

  toast(
    `${name} saved to wishlist.`
  );

}


/* =========================
   BUILD YOUR LOOK
========================= */

function setupBuildYourLook() {

  const lookBtn =
    document.getElementById(
      "lookBtn"
    );

  if (!lookBtn) return;

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
    document.getElementById(
      "toast"
    );

  if (!element) return;

  element.textContent =
    message;

  element.classList.add(
    "show"
  );

  clearTimeout(
    window.toastTimer
  );

  window.toastTimer =
    setTimeout(() => {

      element.classList.remove(
        "show"
      );

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
