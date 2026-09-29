# 🛒 FreshRoots - Online Grocery Shop with OTP Security

A modern, responsive, and feature-packed grocery web application with **Indian Rupee (₹) pricing**, **OTP authentication**, and **online image uploads**, ready to be hosted on **GitHub Pages** with zero backend configuration needed.

## ✨ Key Features

- 🔐 **OTP Security Authentication**: Complete phone/email verification login flow with 6-digit auto-advancing pin boxes, countdown timer, resend OTP, and brute-force protection.
- 🖼️ **Online Image Upload & Preset Library**: Easily add new grocery items using direct online image URLs, local file uploads (Base64), or select from built-in curated online grocery presets.
- 🛍️ **Rich Product Catalog (in ₹ INR)**: Filter by category (*Fruits, Vegetables, Dairy, Bakery, Staples, etc.*), search with instant suggestions, sort, and view product details.
- 🛒 **Interactive Slide-over Cart**: Quantity controls, delivery fee estimator, coupon codes (e.g. `FRESH20` or `FRESH50`), and real-time total calculation.
- 📦 **Seamless Checkout & Order Tracking**: Multiple delivery slots, payment choices (*COD, UPI / Online Pay*), confetti celebration, and order history storage.
- 💾 **100% Client-Side Persistent**: Uses browser `localStorage` to save user sessions, cart items, newly added grocery products, and past orders.
- 🚀 **GitHub Pages Ready**: Built purely with HTML5, Tailwind CSS, and Vanilla JavaScript—host it for free on GitHub Pages in 2 minutes!

---

## 🌐 How to Host on GitHub Pages (Step-by-Step)

### Option 1: Using GitHub Web Interface (Easiest)
1. Go to [GitHub.com](https://github.com) and click **New Repository**.
2. Name your repository (e.g., `grocery-shop`), set it to **Public**, and click **Create repository**.
3. Click **Upload files** and drag all files (`index.html`, `js/`, `README.md`) from this folder.
4. Commit the changes.
5. Go to your repository **Settings** ⚙️ -> Click **Pages** in the left sidebar.
6. Under **Branch**, select `main` (or `master`) and folder `/ (root)`, then click **Save**.
7. In about 1 minute, your site will be live at: `https://<your-username>.github.io/<repository-name>/`!

### Option 2: Using Git Command Line
```bash
cd grocery-shop
git init
git add .
git commit -m "Initial commit of FreshRoots Grocery Shop"
git branch -M main
git remote add origin https://github.com/<your-username>/grocery-shop.git
git push -u origin main
```
Then enable GitHub Pages in repo **Settings > Pages**.

---

## 🔑 Demo Credentials & Quick Tips
- **Login**: Click **"Login"** in the top navbar. Enter any 10-digit mobile number (e.g. `9876543210`) or email. A simulated notification toast will pop up showing your 6-digit verification code with a quick copy button.
- **Promo Codes**: Use `FRESH20` for 20% discount or `FRESH50` for ₹100 off on orders above ₹599. Free delivery is automatically applied on orders above ₹499.
- **Admin Item Adder**: Click the **"+ Add Item"** button in the top navigation bar to add any grocery product with an online image URL.
