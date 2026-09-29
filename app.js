/**
 * FreshRoots Grocery Shop - Main Application Controller (Rupees ₹ & Login)
 */

// Global App State
const AppState = {
  currentCategory: "all",
  searchQuery: "",
  activeProductModal: null,
  otpCountdown: 60,
  otpTimerId: null
};

// UI Elements & Helpers
document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

function initApp() {
  renderCategories();
  renderProducts();
  renderImagePresets();
  setupEventListeners();
  setupAuthWatchers();
  setupCartWatchers();
}

// ----------------------------------------------------
// PRODUCT RENDERING & FILTERING
// ----------------------------------------------------

const CATEGORIES = [
  { id: "all", name: "All Groceries", icon: "sparkles" },
  { id: "fruits", name: "Fresh Fruits", icon: "apple" },
  { id: "vegetables", name: "Vegetables", icon: "carrot" },
  { id: "dairy", name: "Dairy & Eggs", icon: "milk" },
  { id: "bakery", name: "Bakery & Breads", icon: "croissant" },
  { id: "beverages", name: "Beverages", icon: "cup-soda" },
  { id: "staples", name: "Organic Staples", icon: "wheat" },
  { id: "snacks", name: "Snacks & Sweets", icon: "cookie" }
];

function renderCategories() {
  const container = document.getElementById("category-pills");
  if (!container) return;

  container.innerHTML = CATEGORIES.map(cat => {
    const isActive = AppState.currentCategory === cat.id;
    return `
      <button 
        onclick="setCategory('${cat.id}')"
        class="category-btn whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 border ${
          isActive 
            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20' 
            : 'bg-white hover:bg-emerald-50 text-slate-700 border-slate-200 hover:border-emerald-300'
        }"
      >
        <span>${cat.name}</span>
      </button>
    `;
  }).join("");
}

function setCategory(categoryId) {
  AppState.currentCategory = categoryId;
  renderCategories();
  renderProducts();
}

function renderProducts() {
  const container = document.getElementById("products-grid");
  const emptyState = document.getElementById("no-products-state");
  const countBadge = document.getElementById("products-count-badge");
  if (!container) return;

  const allProducts = ProductManager.getProducts();

  const filtered = allProducts.filter(item => {
    const matchesCategory = AppState.currentCategory === "all" || item.category === AppState.currentCategory;
    const matchesSearch = !AppState.searchQuery || 
      item.name.toLowerCase().includes(AppState.searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(AppState.searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(AppState.searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (countBadge) {
    countBadge.textContent = `${filtered.length} items available`;
  }

  if (filtered.length === 0) {
    container.innerHTML = "";
    if (emptyState) emptyState.classList.remove("hidden");
    return;
  }

  if (emptyState) emptyState.classList.add("hidden");

  container.innerHTML = filtered.map(product => {
    const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
    
    // Check if in cart
    const cartItem = CartManager.items.find(i => i.product.id === product.id);
    const cartQty = cartItem ? cartItem.quantity : 0;

    return `
      <div class="group bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 flex flex-col overflow-hidden relative">
        
        <!-- Badge -->
        <div class="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          ${product.badge ? `
            <span class="px-2.5 py-1 bg-emerald-500/90 backdrop-blur text-white text-[11px] font-semibold rounded-lg tracking-wide shadow-sm">
              ${product.badge}
            </span>
          ` : ''}
          ${discount > 0 ? `
            <span class="px-2.5 py-1 bg-amber-500/90 backdrop-blur text-white text-[11px] font-semibold rounded-lg tracking-wide shadow-sm">
              -${discount}%
            </span>
          ` : ''}
        </div>

        <!-- Delete item button for user-added items -->
        ${product.id.startsWith("prod-1") || product.id.startsWith("prod-2") || product.id.startsWith("prod-3") || product.id.startsWith("prod-4") || product.id.startsWith("prod-5") || product.id.startsWith("prod-6") || product.id.startsWith("prod-7") || product.id.startsWith("prod-8") || product.id.startsWith("prod-9") ? '' : `
          <button 
            onclick="deleteCustomProduct('${product.id}', event)" 
            title="Delete custom product"
            class="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center shadow-md transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </button>
        `}

        <!-- Product Image Container -->
        <div 
          onclick="openQuickView('${product.id}')"
          class="h-48 w-full bg-slate-50 overflow-hidden cursor-pointer relative flex items-center justify-center group-hover:scale-105 transition-transform duration-500"
        >
          <img 
            src="${product.image}" 
            alt="${product.name}" 
            class="w-full h-full object-cover"
            loading="lazy"
            onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>

        <!-- Product Details -->
        <div class="p-4 flex-1 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span class="capitalize font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">${product.category}</span>
              <span class="flex items-center gap-1 font-medium text-amber-500">
                ★ ${product.rating.toFixed(1)} <span class="text-slate-400">(${product.reviews})</span>
              </span>
            </div>

            <h3 
              onclick="openQuickView('${product.id}')" 
              class="font-semibold text-slate-800 text-base leading-snug hover:text-emerald-600 transition-colors cursor-pointer line-clamp-1"
            >
              ${product.name}
            </h3>
            
            <p class="text-xs text-slate-500 mt-0.5">${product.unit}</p>
          </div>

          <!-- Price & Action -->
          <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <div>
              <div class="flex items-baseline gap-1.5">
                <span class="text-lg font-bold text-slate-900">₹${product.price}</span>
                ${product.originalPrice ? `
                  <span class="text-xs text-slate-400 line-through">₹${product.originalPrice}</span>
                ` : ''}
              </div>
            </div>

            <!-- Cart Controls -->
            <div id="cart-btn-box-${product.id}">
              ${cartQty > 0 ? `
                <div class="flex items-center bg-emerald-50 border border-emerald-300 rounded-xl px-2 py-1 shadow-sm">
                  <button 
                    onclick="updateCartItemQty('${product.id}', ${cartQty - 1})"
                    class="w-6 h-6 rounded-lg bg-white text-emerald-700 font-bold hover:bg-emerald-600 hover:text-white transition-colors flex items-center justify-center text-sm shadow-xs"
                  >-</button>
                  <span class="mx-2.5 text-xs font-bold text-emerald-800">${cartQty}</span>
                  <button 
                    onclick="updateCartItemQty('${product.id}', ${cartQty + 1})"
                    class="w-6 h-6 rounded-lg bg-white text-emerald-700 font-bold hover:bg-emerald-600 hover:text-white transition-colors flex items-center justify-center text-sm shadow-xs"
                  >+</button>
                </div>
              ` : `
                <button 
                  onclick="quickAddToCart('${product.id}')" 
                  class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                  Add
                </button>
              `}
            </div>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function quickAddToCart(productId) {
  const products = ProductManager.getProducts();
  const product = products.find(p => p.id === productId);
  if (product) {
    CartManager.addItem(product, 1);
    showToast(`Added "${product.name}" to cart! 🛒`, "success");
    renderProducts();
  }
}

function updateCartItemQty(productId, newQty) {
  CartManager.updateQuantity(productId, newQty);
  renderProducts();
}

function deleteCustomProduct(productId, event) {
  if (event) event.stopPropagation();
  if (confirm("Are you sure you want to remove this grocery product?")) {
    ProductManager.deleteProduct(productId);
    CartManager.removeItem(productId);
    showToast("Product deleted successfully.", "info");
    renderProducts();
  }
}

// ----------------------------------------------------
// SEARCH & EVENT LISTENERS
// ----------------------------------------------------

function setupEventListeners() {
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      AppState.searchQuery = e.target.value.trim();
      renderProducts();
    });
  }

  // Clear search
  const clearSearchBtn = document.getElementById("clear-search-btn");
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      AppState.searchQuery = "";
      renderProducts();
    });
  }

  // Setup OTP Inputs Auto-Jump and Paste
  setupOtpInputNavigation();
}

// ----------------------------------------------------
// ONLINE IMAGE UPLOAD & ADD PRODUCT MODAL
// ----------------------------------------------------

function renderImagePresets() {
  const container = document.getElementById("preset-images-container");
  if (!container) return;

  const presets = ProductManager.getPresets();
  container.innerHTML = presets.map(p => `
    <button 
      type="button" 
      onclick="selectImagePreset('${p.url}', '${p.name}')"
      class="group relative rounded-xl overflow-hidden border-2 border-slate-200 hover:border-emerald-500 focus:outline-hidden transition-all text-left"
    >
      <img src="${p.url}" alt="${p.name}" class="w-full h-16 object-cover group-hover:scale-110 transition-transform duration-300" />
      <span class="absolute inset-x-0 bottom-0 bg-slate-900/80 text-white text-[10px] py-0.5 px-1.5 text-center font-medium truncate block">
        ${p.name}
      </span>
    </button>
  `).join("");
}

function selectImagePreset(url, name) {
  const urlInput = document.getElementById("item-image-url");
  if (urlInput) {
    urlInput.value = url;
    previewUploadedImage(url);
  }
}

function previewUploadedImage(url) {
  const previewImg = document.getElementById("image-preview-element");
  const previewBox = document.getElementById("image-preview-box");
  const placeholder = document.getElementById("image-preview-placeholder");

  if (!url) {
    if (previewImg) previewImg.src = "";
    if (previewBox) previewBox.classList.add("hidden");
    if (placeholder) placeholder.classList.remove("hidden");
    return;
  }

  if (previewImg) {
    previewImg.src = url;
    previewImg.onerror = () => {
      showToast("Could not load image from URL. Check if the link is public.", "error");
    };
  }
  if (previewBox) previewBox.classList.remove("hidden");
  if (placeholder) placeholder.classList.add("hidden");
}

function handleFileUpload(input) {
  const file = input.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    showToast("Please choose an image file (PNG, JPG, WebP).", "error");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const base64Data = e.target.result;
    const urlInput = document.getElementById("item-image-url");
    if (urlInput) urlInput.value = base64Data;
    previewUploadedImage(base64Data);
  };
  reader.readAsDataURL(file);
}

function openAddProductModal() {
  const modal = document.getElementById("add-product-modal");
  if (!modal) return;
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  previewUploadedImage("");
}

function closeAddProductModal() {
  const modal = document.getElementById("add-product-modal");
  if (!modal) return;
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  const form = document.getElementById("add-product-form");
  if (form) form.reset();
}

function handleSaveProduct(e) {
  e.preventDefault();

  const name = document.getElementById("item-name").value.trim();
  const category = document.getElementById("item-category").value;
  const price = parseFloat(document.getElementById("item-price").value);
  const originalPrice = parseFloat(document.getElementById("item-original-price").value) || null;
  const unit = document.getElementById("item-unit").value.trim() || "1 unit";
  const badge = document.getElementById("item-badge").value.trim() || "Fresh Arrival";
  const imageUrl = document.getElementById("item-image-url").value.trim();
  const description = document.getElementById("item-desc").value.trim() || "Fresh and high quality grocery item.";

  if (!name || isNaN(price) || price <= 0) {
    showToast("Please provide a valid product name and price.", "error");
    return;
  }

  const finalImage = imageUrl || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80";

  ProductManager.addProduct({
    name,
    category,
    price,
    originalPrice,
    unit,
    badge,
    image: finalImage,
    description
  });

  closeAddProductModal();
  renderProducts();
  showToast(`Grocery item "${name}" created successfully! 🎉`, "success");
}

// ----------------------------------------------------
// OTP AUTHENTICATION UI & CONTROLLER
// ----------------------------------------------------

function setupAuthWatchers() {
  AuthManager.onAuthChange((user) => {
    const loginBtn = document.getElementById("nav-login-btn");
    const userProfileMenu = document.getElementById("nav-user-profile");
    const userDisplayName = document.getElementById("nav-user-name");

    if (user) {
      if (loginBtn) loginBtn.classList.add("hidden");
      if (userProfileMenu) userProfileMenu.classList.remove("hidden");
      if (userDisplayName) userDisplayName.textContent = user.name;
    } else {
      if (loginBtn) loginBtn.classList.remove("hidden");
      if (userProfileMenu) userProfileMenu.classList.add("hidden");
    }
  });
}

function openAuthModal() {
  const modal = document.getElementById("auth-modal");
  if (!modal) return;
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  showAuthStep(1);
}

function closeAuthModal() {
  const modal = document.getElementById("auth-modal");
  if (!modal) return;
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  clearInterval(AppState.otpTimerId);
}

function showAuthStep(step) {
  const step1 = document.getElementById("auth-step-1");
  const step2 = document.getElementById("auth-step-2");
  const errorMsg = document.getElementById("auth-error-msg");
  if (errorMsg) errorMsg.classList.add("hidden");

  if (step === 1) {
    if (step1) step1.classList.remove("hidden");
    if (step2) step2.classList.add("hidden");
    const phoneInput = document.getElementById("auth-identifier-input");
    if (phoneInput) phoneInput.focus();
  } else {
    if (step1) step1.classList.add("hidden");
    if (step2) step2.classList.remove("hidden");
    
    // Clear & focus first OTP digit
    const digits = document.querySelectorAll(".otp-digit-input");
    digits.forEach(d => d.value = "");
    if (digits[0]) digits[0].focus();

    startOtpTimer();
  }
}

function handleRequestOtp(e) {
  if (e) e.preventDefault();
  const input = document.getElementById("auth-identifier-input");
  const errorMsg = document.getElementById("auth-error-msg");
  const val = input ? input.value.trim() : "";

  if (!val) {
    if (errorMsg) {
      errorMsg.textContent = "Please enter your mobile number or email address.";
      errorMsg.classList.remove("hidden");
    }
    return;
  }

  const isEmail = val.includes("@");
  const type = isEmail ? "email" : "phone";

  try {
    const result = AuthManager.requestOtp(val, type);
    const targetLabel = document.getElementById("otp-target-display");
    if (targetLabel) targetLabel.textContent = result.target;

    showAuthStep(2);
    showToast(`OTP Code sent to ${val}`, "info");
  } catch (err) {
    if (errorMsg) {
      errorMsg.textContent = err.message;
      errorMsg.classList.remove("hidden");
    }
  }
}

function handleVerifyOtp(e) {
  if (e) e.preventDefault();
  const digits = document.querySelectorAll(".otp-digit-input");
  let enteredCode = "";
  digits.forEach(d => enteredCode += d.value);

  const errorMsg = document.getElementById("auth-error-msg");

  if (enteredCode.length !== 6) {
    if (errorMsg) {
      errorMsg.textContent = "Please enter the complete 6-digit security code.";
      errorMsg.classList.remove("hidden");
    }
    return;
  }

  const result = AuthManager.verifyOtp(enteredCode);

  if (result.success) {
    closeAuthModal();
    showToast(`Welcome back, ${result.user.name}! 🔐 Logged in.`, "success");
  } else {
    if (errorMsg) {
      errorMsg.textContent = result.message;
      errorMsg.classList.remove("hidden");
    }
    // Shake inputs
    const box = document.getElementById("otp-inputs-wrapper");
    if (box) {
      box.classList.add("animate-shake");
      setTimeout(() => box.classList.remove("animate-shake"), 500);
    }
  }
}

function handleResendOtp() {
  const btn = document.getElementById("resend-otp-btn");
  if (btn && btn.disabled) return;

  try {
    AuthManager.requestOtp(AuthManager.otpTarget, AuthManager.otpTargetType);
    startOtpTimer();
    showToast("New OTP security code sent!", "info");
  } catch (err) {
    showToast(err.message, "error");
  }
}

function startOtpTimer() {
  clearInterval(AppState.otpTimerId);
  AppState.otpCountdown = 60;

  const timerEl = document.getElementById("otp-countdown-text");
  const resendBtn = document.getElementById("resend-otp-btn");
  if (resendBtn) resendBtn.disabled = true;

  const update = () => {
    if (timerEl) timerEl.textContent = `Resend available in ${AppState.otpCountdown}s`;
    if (AppState.otpCountdown <= 0) {
      clearInterval(AppState.otpTimerId);
      if (timerEl) timerEl.textContent = "";
      if (resendBtn) {
        resendBtn.disabled = false;
        resendBtn.classList.remove("text-slate-400", "cursor-not-allowed");
        resendBtn.classList.add("text-emerald-600", "hover:underline", "cursor-pointer");
      }
    }
    AppState.otpCountdown--;
  };

  update();
  AppState.otpTimerId = setInterval(update, 1000);
}

function setupOtpInputNavigation() {
  const inputs = document.querySelectorAll(".otp-digit-input");
  inputs.forEach((input, index) => {
    input.addEventListener("input", (e) => {
      const val = e.target.value;
      if (val.length === 1 && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }
      // If 6th entered, auto-verify
      if (index === inputs.length - 1 && val.length === 1) {
        let code = "";
        inputs.forEach(i => code += i.value);
        if (code.length === 6) {
          handleVerifyOtp();
        }
      }
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !e.target.value && index > 0) {
        inputs[index - 1].focus();
      }
    });

    input.addEventListener("paste", (e) => {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData("text").replace(/\D/g, "");
      if (text.length >= 6) {
        text.slice(0, 6).split("").forEach((char, i) => {
          if (inputs[i]) inputs[i].value = char;
        });
        inputs[5].focus();
        handleVerifyOtp();
      }
    });
  });
}

function handleUserLogout() {
  AuthManager.logout();
  showToast("You have been signed out.", "info");
}

// ----------------------------------------------------
// CART & DRAWER UI
// ----------------------------------------------------

function setupCartWatchers() {
  CartManager.onCartChange((summary) => {
    // Update badge counter
    const badge = document.getElementById("cart-badge-count");
    if (badge) {
      badge.textContent = summary.count;
      badge.classList.toggle("hidden", summary.count === 0);
    }

    renderCartDrawer(summary);
  });
}

function toggleCartDrawer() {
  const drawer = document.getElementById("cart-drawer");
  const backdrop = document.getElementById("cart-drawer-backdrop");
  const panel = document.getElementById("cart-drawer-panel");

  if (!drawer || !backdrop || !panel) return;

  const isHidden = drawer.classList.contains("hidden");

  if (isHidden) {
    drawer.classList.remove("hidden");
    setTimeout(() => {
      backdrop.classList.remove("opacity-0");
      panel.classList.remove("translate-x-full");
    }, 10);
  } else {
    backdrop.classList.add("opacity-0");
    panel.classList.add("translate-x-full");
    setTimeout(() => {
      drawer.classList.add("hidden");
    }, 300);
  }
}

function renderCartDrawer(summary) {
  const itemsContainer = document.getElementById("cart-items-list");
  const emptyState = document.getElementById("cart-empty-state");
  const footer = document.getElementById("cart-drawer-footer");
  const subtotalEl = document.getElementById("cart-subtotal-val");
  const discountRow = document.getElementById("cart-discount-row");
  const discountEl = document.getElementById("cart-discount-val");
  const deliveryEl = document.getElementById("cart-delivery-val");
  const totalEl = document.getElementById("cart-total-val");
  const freeShipBar = document.getElementById("free-shipping-progress");
  const freeShipText = document.getElementById("free-shipping-text");

  if (!itemsContainer) return;

  if (summary.items.length === 0) {
    itemsContainer.innerHTML = "";
    if (emptyState) emptyState.classList.remove("hidden");
    if (footer) footer.classList.add("hidden");
    return;
  }

  if (emptyState) emptyState.classList.add("hidden");
  if (footer) footer.classList.remove("hidden");

  // Free delivery bar calculation
  if (freeShipBar && freeShipText) {
    const percent = Math.min(100, (summary.subtotal / summary.freeDeliveryThreshold) * 100);
    freeShipBar.style.width = `${percent}%`;
    if (summary.freeDeliveryLeft <= 0) {
      freeShipText.innerHTML = `🎉 You unlocked <strong>FREE Express Delivery</strong>!`;
      freeShipBar.classList.replace("bg-amber-500", "bg-emerald-500");
    } else {
      freeShipText.innerHTML = `Add <strong>₹${Math.ceil(summary.freeDeliveryLeft)}</strong> more for <strong>FREE Delivery</strong>`;
      freeShipBar.classList.replace("bg-emerald-500", "bg-amber-500");
    }
  }

  // Render items
  itemsContainer.innerHTML = summary.items.map(item => `
    <div class="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-xs">
      <img 
        src="${item.product.image}" 
        alt="${item.product.name}" 
        class="w-16 h-16 rounded-xl object-cover bg-slate-50 border border-slate-100 shrink-0"
      />
      <div class="flex-1 min-w-0">
        <h4 class="text-sm font-semibold text-slate-800 truncate">${item.product.name}</h4>
        <p class="text-xs text-slate-500">${item.product.unit}</p>
        <div class="text-sm font-bold text-slate-900 mt-1">₹${item.product.price * item.quantity}</div>
      </div>
      
      <!-- Quantity selector -->
      <div class="flex items-center bg-slate-100 rounded-xl px-2 py-1">
        <button 
          onclick="updateCartItemQty('${item.product.id}', ${item.quantity - 1})"
          class="w-6 h-6 rounded-lg bg-white text-slate-700 font-bold hover:bg-emerald-600 hover:text-white transition-colors flex items-center justify-center text-xs shadow-xs"
        >-</button>
        <span class="mx-2 text-xs font-bold text-slate-800">${item.quantity}</span>
        <button 
          onclick="updateCartItemQty('${item.product.id}', ${item.quantity + 1})"
          class="w-6 h-6 rounded-lg bg-white text-slate-700 font-bold hover:bg-emerald-600 hover:text-white transition-colors flex items-center justify-center text-xs shadow-xs"
        >+</button>
      </div>

      <button 
        onclick="CartManager.removeItem('${item.product.id}')"
        class="text-slate-400 hover:text-rose-600 p-1 transition-colors"
        title="Remove item"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  `).join("");

  // Price calculations
  if (subtotalEl) subtotalEl.textContent = `₹${summary.subtotal}`;
  
  if (summary.discount > 0) {
    if (discountRow) discountRow.classList.remove("hidden");
    if (discountEl) discountEl.textContent = `-₹${Math.round(summary.discount)}`;
  } else {
    if (discountRow) discountRow.classList.add("hidden");
  }

  if (deliveryEl) {
    deliveryEl.textContent = summary.deliveryFee === 0 ? "FREE" : `₹${summary.deliveryFee}`;
  }

  if (totalEl) totalEl.textContent = `₹${Math.round(summary.total)}`;
}

function handleApplyCoupon() {
  const input = document.getElementById("coupon-code-input");
  const val = input ? input.value.trim() : "";
  const res = CartManager.applyCoupon(val);
  if (res.success) {
    showToast(res.message, "success");
    if (input) input.value = "";
  } else {
    showToast(res.message, "error");
  }
}

// ----------------------------------------------------
// CHECKOUT & ORDER CONFIRMATION
// ----------------------------------------------------

function openCheckoutModal() {
  // Check auth requirement
  if (!AuthManager.isAuthenticated()) {
    showToast("Please login with OTP verification before checking out.", "info");
    openAuthModal();
    return;
  }

  const summary = CartManager.getCartSummary();
  if (summary.items.length === 0) {
    showToast("Your cart is empty.", "error");
    return;
  }

  toggleCartDrawer(); // close drawer

  const modal = document.getElementById("checkout-modal");
  if (!modal) return;

  // Pre-fill user data
  const user = AuthManager.getUser();
  const phoneField = document.getElementById("checkout-phone");
  if (phoneField && user) {
    phoneField.value = user.identifier;
  }

  const checkoutTotal = document.getElementById("checkout-modal-total");
  if (checkoutTotal) checkoutTotal.textContent = `₹${Math.round(summary.total)}`;

  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeCheckoutModal() {
  const modal = document.getElementById("checkout-modal");
  if (!modal) return;
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

function handlePlaceOrder(e) {
  e.preventDefault();

  const name = document.getElementById("checkout-name").value.trim();
  const phone = document.getElementById("checkout-phone").value.trim();
  const address = document.getElementById("checkout-address").value.trim();
  const slot = document.getElementById("checkout-slot").value;
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || "Cash on Delivery";

  if (!name || !address) {
    showToast("Please provide your delivery recipient name and address.", "error");
    return;
  }

  try {
    const order = CartManager.placeOrder({
      name,
      phone,
      address,
      deliverySlot: slot,
      paymentMethod
    });

    closeCheckoutModal();
    openOrderSuccessModal(order);
    triggerConfetti();
    renderProducts();
  } catch (err) {
    showToast(err.message, "error");
  }
}

function openOrderSuccessModal(order) {
  const modal = document.getElementById("order-success-modal");
  if (!modal) return;

  const idEl = document.getElementById("success-order-id");
  const totalEl = document.getElementById("success-order-total");
  const destEl = document.getElementById("success-order-dest");

  if (idEl) idEl.textContent = order.id;
  if (totalEl) totalEl.textContent = `₹${Math.round(order.summary.total)}`;
  if (destEl) destEl.textContent = order.customer.address;

  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeOrderSuccessModal() {
  const modal = document.getElementById("order-success-modal");
  if (!modal) return;
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

// ----------------------------------------------------
// ORDER HISTORY MODAL
// ----------------------------------------------------

function openOrderHistoryModal() {
  const modal = document.getElementById("order-history-modal");
  const container = document.getElementById("orders-history-list");
  const emptyState = document.getElementById("orders-empty-state");

  if (!modal || !container) return;

  const orders = CartManager.getOrders();

  if (orders.length === 0) {
    container.innerHTML = "";
    if (emptyState) emptyState.classList.remove("hidden");
  } else {
    if (emptyState) emptyState.classList.add("hidden");
    container.innerHTML = orders.map(order => `
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs mb-3">
        <div class="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
          <div>
            <span class="font-mono font-bold text-slate-800 text-sm">${order.id}</span>
            <div class="text-[11px] text-slate-400">${new Date(order.createdAt).toLocaleString()}</div>
          </div>
          <span class="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg">
            ${order.status}
          </span>
        </div>

        <div class="space-y-1.5 mb-3">
          ${order.items.map(item => `
            <div class="flex items-center justify-between text-xs text-slate-600">
              <span class="truncate">${item.quantity}x ${item.product.name} (${item.product.unit})</span>
              <span class="font-semibold text-slate-800">₹${item.product.price * item.quantity}</span>
            </div>
          `).join("")}
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-medium text-slate-600">
          <span>Payment: ${order.customer.paymentMethod}</span>
          <span class="text-sm font-bold text-slate-900">Total: ₹${Math.round(order.summary.total)}</span>
        </div>
      </div>
    `).join("");
  }

  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeOrderHistoryModal() {
  const modal = document.getElementById("order-history-modal");
  if (!modal) return;
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

// ----------------------------------------------------
// PRODUCT QUICK VIEW MODAL
// ----------------------------------------------------

function openQuickView(productId) {
  const product = ProductManager.getProducts().find(p => p.id === productId);
  if (!product) return;

  const modal = document.getElementById("quickview-modal");
  if (!modal) return;

  document.getElementById("qv-img").src = product.image;
  document.getElementById("qv-name").textContent = product.name;
  document.getElementById("qv-category").textContent = product.category;
  document.getElementById("qv-price").textContent = `₹${product.price}`;
  document.getElementById("qv-unit").textContent = product.unit;
  document.getElementById("qv-desc").textContent = product.description;
  document.getElementById("qv-rating").textContent = `${product.rating.toFixed(1)} (${product.reviews} reviews)`;

  const addBtn = document.getElementById("qv-add-btn");
  if (addBtn) {
    addBtn.onclick = () => {
      CartManager.addItem(product, 1);
      showToast(`Added "${product.name}" to cart! 🛒`, "success");
      closeQuickView();
      renderProducts();
    };
  }

  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeQuickView() {
  const modal = document.getElementById("quickview-modal");
  if (!modal) return;
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

// ----------------------------------------------------
// UTILITIES (Confetti & Toasts)
// ----------------------------------------------------

function showToast(message, type = "info") {
  const existing = document.getElementById("app-global-toast");
  if (existing) existing.remove();

  const colors = {
    success: "bg-emerald-600 text-white border-emerald-500",
    error: "bg-rose-600 text-white border-rose-500",
    info: "bg-slate-900 text-white border-slate-700"
  };

  const toast = document.createElement("div");
  toast.id = "app-global-toast";
  toast.className = `fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-sm font-medium transition-all duration-300 transform translate-y-0 backdrop-blur-md ${colors[type] || colors.info}`;
  toast.innerHTML = `
    <span>${message}</span>
  `;

  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function triggerConfetti() {
  if (typeof confetti === "function") {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
}
