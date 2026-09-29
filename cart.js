/**
 * FreshRoots Grocery Shop - Cart & Order Management Module (Rupees ₹)
 */

const CART_STORAGE_KEY = "freshroots_cart_inr_v2";
const ORDERS_STORAGE_KEY = "freshroots_orders_inr_v2";

const CartManager = {
  items: [],
  appliedCoupon: null,
  deliveryFee: 40,
  freeDeliveryThreshold: 499,
  listeners: [],

  coupons: {
    "FRESH20": { discountPercent: 20, description: "20% OFF on all fresh items", minSpend: 299 },
    "FRESH50": { flatDiscount: 100, description: "₹100 OFF on orders above ₹599", minSpend: 599 },
    "FREESHIP": { freeShipping: true, description: "Free Express Delivery", minSpend: 299 }
  },

  init() {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        this.items = JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Cart init error:", e);
      this.items = [];
    }
  },

  onCartChange(callback) {
    this.listeners.push(callback);
    callback(this.getCartSummary());
  },

  notifyListeners() {
    const summary = this.getCartSummary();
    this.listeners.forEach(cb => cb(summary));
  },

  save() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.items));
    this.notifyListeners();
  },

  addItem(product, quantity = 1) {
    const existingIndex = this.items.findIndex(item => item.product.id === product.id);
    if (existingIndex > -1) {
      this.items[existingIndex].quantity += quantity;
    } else {
      this.items.push({
        product: product,
        quantity: quantity,
        addedAt: new Date().toISOString()
      });
    }
    this.save();
  },

  updateQuantity(productId, quantity) {
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }
    const item = this.items.find(i => i.product.id === productId);
    if (item) {
      item.quantity = quantity;
      this.save();
    }
  },

  removeItem(productId) {
    this.items = this.items.filter(i => i.product.id !== productId);
    this.save();
  },

  clearCart() {
    this.items = [];
    this.appliedCoupon = null;
    this.save();
  },

  applyCoupon(code) {
    if (!code) return { success: false, message: "Please enter a coupon code." };
    const upper = code.trim().toUpperCase();
    const coupon = this.coupons[upper];
    
    if (!coupon) {
      return { success: false, message: "Invalid promo code. Try 'FRESH20' or 'FRESH50'." };
    }

    const subtotal = this.getSubtotal();
    if (coupon.minSpend && subtotal < coupon.minSpend) {
      return { 
        success: false, 
        message: `Minimum order of ₹${coupon.minSpend} required for ${upper}. Current subtotal: ₹${subtotal.toFixed(0)}` 
      };
    }

    this.appliedCoupon = { code: upper, ...coupon };
    this.notifyListeners();
    return { success: true, message: `Coupon "${upper}" applied successfully!` };
  },

  removeCoupon() {
    this.appliedCoupon = null;
    this.notifyListeners();
  },

  getSubtotal() {
    return this.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  },

  getItemCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  },

  getDiscountAmount() {
    const subtotal = this.getSubtotal();
    if (!this.appliedCoupon) return 0;

    if (this.appliedCoupon.discountPercent) {
      return (subtotal * this.appliedCoupon.discountPercent) / 100;
    }
    if (this.appliedCoupon.flatDiscount) {
      return Math.min(this.appliedCoupon.flatDiscount, subtotal);
    }
    return 0;
  },

  getDeliveryFee() {
    const subtotal = this.getSubtotal();
    if (subtotal === 0) return 0;
    if (this.appliedCoupon && this.appliedCoupon.freeShipping) return 0;
    if (subtotal >= this.freeDeliveryThreshold) return 0;
    return this.deliveryFee;
  },

  getTotal() {
    const subtotal = this.getSubtotal();
    if (subtotal === 0) return 0;
    const discount = this.getDiscountAmount();
    const delivery = this.getDeliveryFee();
    return Math.max(0, subtotal - discount + delivery);
  },

  getCartSummary() {
    const subtotal = this.getSubtotal();
    const discount = this.getDiscountAmount();
    const deliveryFee = this.getDeliveryFee();
    const total = this.getTotal();
    const count = this.getItemCount();
    const freeDeliveryLeft = Math.max(0, this.freeDeliveryThreshold - subtotal);

    return {
      items: this.items,
      count: count,
      subtotal: subtotal,
      discount: discount,
      deliveryFee: deliveryFee,
      total: total,
      appliedCoupon: this.appliedCoupon,
      freeDeliveryThreshold: this.freeDeliveryThreshold,
      freeDeliveryLeft: freeDeliveryLeft
    };
  },

  // Checkout and Order Persistence
  placeOrder(orderDetails) {
    const summary = this.getCartSummary();
    if (summary.items.length === 0) {
      throw new Error("Cannot place an order with an empty cart.");
    }

    const order = {
      id: "FR-" + Math.floor(100000 + Math.random() * 900000),
      createdAt: new Date().toISOString(),
      items: [...this.items],
      summary: {
        subtotal: summary.subtotal,
        discount: summary.discount,
        deliveryFee: summary.deliveryFee,
        total: summary.total,
        coupon: this.appliedCoupon ? this.appliedCoupon.code : null
      },
      customer: {
        name: orderDetails.name || "Valued Shopper",
        phone: orderDetails.phone || "N/A",
        address: orderDetails.address || "Standard Delivery Address",
        deliverySlot: orderDetails.deliverySlot || "15-30 Min Express",
        paymentMethod: orderDetails.paymentMethod || "Cash on Delivery",
        notes: orderDetails.notes || ""
      },
      status: "Confirmed (Packing Fresh)"
    };

    // Save order in history
    const existingOrders = this.getOrders();
    existingOrders.unshift(order);
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(existingOrders));

    // Empty cart
    this.clearCart();

    return order;
  },

  getOrders() {
    try {
      const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.warn("Could not load orders:", e);
      return [];
    }
  }
};

CartManager.init();
