/**
 * FreshRoots Grocery Shop - Initial Products & Storage Manager (Rupees ₹)
 */

const DEFAULT_PRODUCTS = [
  {
    id: "prod-1",
    name: "Organic Red Apples",
    category: "fruits",
    price: 180,
    originalPrice: 240,
    unit: "1 kg (approx. 5-6 pcs)",
    rating: 4.8,
    reviews: 142,
    badge: "Organic",
    image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80",
    description: "Crisp, sweet, and freshly harvested organic Royal Gala apples directly from local orchards.",
    inStock: true
  },
  {
    id: "prod-2",
    name: "Fresh Farm Broccoli",
    category: "vegetables",
    price: 65,
    originalPrice: 90,
    unit: "500 g",
    rating: 4.7,
    reviews: 89,
    badge: "Farm Fresh",
    image: "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=600&q=80",
    description: "Vibrant green, pesticide-free broccoli crowns packed with vitamins, iron, and fiber.",
    inStock: true
  },
  {
    id: "prod-3",
    name: "Pure Farm Whole Milk",
    category: "dairy",
    price: 64,
    originalPrice: 75,
    unit: "1 Litre pouch / bottle",
    rating: 4.9,
    reviews: 310,
    badge: "Bestseller",
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80",
    description: "Rich and creamy homogenized pasteurized whole milk, sourced from grass-fed cows.",
    inStock: true
  },
  {
    id: "prod-4",
    name: "Artisan Sourdough Bread",
    category: "bakery",
    price: 120,
    originalPrice: 160,
    unit: "Loaf (450 g)",
    rating: 4.9,
    reviews: 95,
    badge: "Fresh Baked",
    image: "https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=600&q=80",
    description: "Naturally fermented sourdough loaf with a crispy golden crust and tender airy crumb.",
    inStock: true
  },
  {
    id: "prod-5",
    name: "Ripe Hass Avocados",
    category: "fruits",
    price: 240,
    originalPrice: 320,
    unit: "Pack of 2",
    rating: 4.6,
    reviews: 178,
    badge: "Healthy Choice",
    image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=600&q=80",
    description: "Creamy, nutrient-dense ready-to-eat Hass avocados. Perfect for salads and guacamole.",
    inStock: true
  },
  {
    id: "prod-6",
    name: "Vine Ripened Tomatoes",
    category: "vegetables",
    price: 38,
    originalPrice: 50,
    unit: "1 kg",
    rating: 4.5,
    reviews: 64,
    badge: "24% OFF",
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80",
    description: "Juicy, sweet, sun-ripened red tomatoes ideal for curries, pasta sauces, and salads.",
    inStock: true
  },
  {
    id: "prod-7",
    name: "Cold-Pressed Orange Juice",
    category: "beverages",
    price: 135,
    originalPrice: 170,
    unit: "750 ml",
    rating: 4.8,
    reviews: 112,
    badge: "100% Pure",
    image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80",
    description: "100% natural Valencia orange juice with no added sugar, artificial preservatives or water.",
    inStock: true
  },
  {
    id: "prod-8",
    name: "Free-Range Farm Eggs",
    category: "dairy",
    price: 115,
    originalPrice: 140,
    unit: "Pack of 12",
    rating: 4.9,
    reviews: 240,
    badge: "Farm Fresh",
    image: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=600&q=80",
    description: "Brown eggs from pasture-raised hens with rich golden yolks. Cleaned and quality checked.",
    inStock: true
  },
  {
    id: "prod-9",
    name: "Organic Basmati Rice",
    category: "staples",
    price: 299,
    originalPrice: 380,
    unit: "2 kg bag",
    rating: 4.7,
    reviews: 88,
    badge: "Premium",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
    description: "Long-grain aromatic aged Basmati rice. Slender grains that cook fluffy and non-sticky.",
    inStock: true
  },
  {
    id: "prod-10",
    name: "Roasted Almonds & Trail Mix",
    category: "snacks",
    price: 260,
    originalPrice: 340,
    unit: "250 g pack",
    rating: 4.8,
    reviews: 154,
    badge: "Superfood",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
    description: "Lightly salted crunchy California almonds mixed with dried cranberries and pumpkin seeds.",
    inStock: true
  },
  {
    id: "prod-11",
    name: "Crisp Baby Spinach Leaves",
    category: "vegetables",
    price: 35,
    originalPrice: 50,
    unit: "250 g bunch",
    rating: 4.6,
    reviews: 73,
    badge: "Hydroponic",
    image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80",
    description: "Tender baby spinach leaves, pre-washed and ready to cook or blend into healthy smoothies.",
    inStock: true
  },
  {
    id: "prod-12",
    name: "Greek Style Natural Yogurt",
    category: "dairy",
    price: 95,
    originalPrice: 120,
    unit: "400 g tub",
    rating: 4.7,
    reviews: 130,
    badge: "Probiotic",
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80",
    description: "Thick, strained Greek yogurt rich in live active cultures and high in gut-friendly protein.",
    inStock: true
  }
];

// Curated Online Images for Quick-Select Picker
const ONLINE_IMAGE_PRESETS = [
  { name: "Bananas", url: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80" },
  { name: "Strawberries", url: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=600&q=80" },
  { name: "Bell Peppers", url: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=600&q=80" },
  { name: "Carrots", url: "https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?auto=format&fit=crop&w=600&q=80" },
  { name: "Cheese Block", url: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=600&q=80" },
  { name: "Butter Croissant", url: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80" },
  { name: "Green Tea Pack", url: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80" },
  { name: "Extra Virgin Olive Oil", url: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80" },
  { name: "Dark Chocolate", url: "https://images.unsplash.com/photo-1548907040-4baa42d10919?auto=format&fit=crop&w=600&q=80" }
];

const PRODUCTS_STORAGE_KEY = "freshroots_products_inr_v2";

const ProductManager = {
  getProducts() {
    try {
      const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Could not read custom products from localStorage, falling back to defaults.", e);
    }
    // Initialize with defaults if empty
    this.saveProducts(DEFAULT_PRODUCTS);
    return DEFAULT_PRODUCTS;
  },

  saveProducts(products) {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  },

  addProduct(newProduct) {
    const products = this.getProducts();
    const productWithId = {
      ...newProduct,
      id: "prod-" + Date.now(),
      rating: newProduct.rating || 5.0,
      reviews: newProduct.reviews || 1,
      inStock: true
    };
    products.unshift(productWithId);
    this.saveProducts(products);
    return productWithId;
  },

  deleteProduct(id) {
    const products = this.getProducts().filter(p => p.id !== id);
    this.saveProducts(products);
    return products;
  },

  resetDefaults() {
    localStorage.removeItem(PRODUCTS_STORAGE_KEY);
    return this.getProducts();
  },

  getPresets() {
    return ONLINE_IMAGE_PRESETS;
  }
};
