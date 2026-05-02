// Mock Data — THE EDGE
// TODO: Replace with Supabase queries — all data should be fetched from DB

export type Shop = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  emoji: string;
  banner?: string;
  logo?: string;
  isOpen: boolean;
  closedNote?: string;
  prepTime: string;
  rating: number;
  reviewCount: number;
  tags: string[];
  categories: string[];
  paymentLink?: string;
  ownerId?: string;
  letterCode: string;
};

export type MenuItem = {
  id: string;
  shopId: string;
  title: string;
  description: string;
  image: string;
  price: number;
  discount?: number;
  category: string;
  dietaryTags: string[];
  estimatedPrepTime: string;
  availableSlots?: string[];
  maxPerOrder?: number;
  isAvailable: boolean;
  badge?: string;
  popular?: boolean;
  searchKeywords?: string[];
};

export type CartItem = {
  menuItemId: string;
  shopId: string;
  quantity: number;
  notes?: string;
  diningOption: "dine-in" | "takeaway";
};

export type OrderStatus =
  | "new"
  | "preparing"
  | "ready"
  | "completed"
  | "expired"
  | "customer_late";

export type Receipt = {
  id: string;
  orderId: string;
  shopId: string;
  pin4digit: string;
  items: CartItem[];
  pickupTime: string;
  status: OrderStatus;
};

export type Order = {
  id: string;
  userId?: string;
  items: CartItem[];
  status: OrderStatus;
  totalAmount: number;
  pickupTime: string;
  note?: string;
  createdAt: number;
  expiresAt?: number;
  perShopReceipts: Receipt[];
  code: string;
};

export type User = {
  id: string;
  email?: string;
  preferences: Record<string, unknown>;
  favShops: string[];
  favItems: string[];
  recentlyViewed: string[];
};

// ---------------------------------------------------------------------------
// MOCK SHOPS
// TODO: Replace with Supabase query — SELECT * FROM shops WHERE is_approved = true
// ---------------------------------------------------------------------------
export const mockShops: Shop[] = [
  {
    id: "rocky",
    slug: "rocksweats",
    name: "Rocky Sweats",
    tagline: "Sri Lankan sweets & milk toffee",
    description:
      "Handcrafted Sri Lankan confectionery made fresh every morning. From creamy milk toffee to cooling curd lassi — Rocky Sweats brings campus a taste of home.",
    emoji: "🍡",
    banner: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=400&fit=crop",
    isOpen: true,
    prepTime: "5 min",
    rating: 4.8,
    reviewCount: 214,
    tags: ["Desserts", "Beverages", "Vegetarian"],
    categories: ["Desserts", "Drinks"],
    paymentLink: "https://pay.example/rocksweats",
    letterCode: "R",
  },
  {
    id: "desi",
    slug: "desipalace",
    name: "Desi Palace",
    tagline: "Hot meals, rice & curry",
    description:
      "Authentic Sri Lankan rice & curry, kottu roti, and short eats. Freshly cooked daily using traditional recipes passed down through generations.",
    emoji: "🍛",
    banner: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=400&fit=crop",
    isOpen: true,
    prepTime: "12 min",
    rating: 4.7,
    reviewCount: 389,
    tags: ["Rice & Meals", "Halal", "Lunch"],
    categories: ["Rice & Meals", "Snacks"],
    paymentLink: "https://pay.example/desipalace",
    letterCode: "D",
  },
  {
    id: "juice",
    slug: "juicehub",
    name: "Juice Hub",
    tagline: "Cold-pressed & fresh",
    description:
      "Every cup is blended to order from fresh local fruits. No added sugar, no preservatives — just pure, cold-pressed goodness.",
    emoji: "🥤",
    banner: "https://images.unsplash.com/photo-1546173159-315724a31696?w=800&h=400&fit=crop",
    isOpen: true,
    prepTime: "3 min",
    rating: 4.9,
    reviewCount: 502,
    tags: ["Juice", "Vegan", "Gluten-Free"],
    categories: ["Juice", "Smoothies"],
    paymentLink: "https://pay.example/juicehub",
    letterCode: "J",
  },
  {
    id: "snack",
    slug: "shorteats",
    name: "Short Eats Co.",
    tagline: "Crispy snacks all day",
    description:
      "Golden-fried samosas, cutlets and rolls — made in small batches all day long. The perfect snack between lectures.",
    emoji: "🥟",
    banner: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&h=400&fit=crop",
    isOpen: true,
    prepTime: "4 min",
    rating: 4.6,
    reviewCount: 178,
    tags: ["Snacks", "Vegan", "Quick Bite"],
    categories: ["Snacks"],
    paymentLink: "https://pay.example/shorteats",
    letterCode: "S",
  },
  {
    id: "brew",
    slug: "brewlab",
    name: "Brew Lab",
    tagline: "Coffee & cold brew",
    description:
      "Specialty coffee from single-origin Sri Lankan estate beans. Espresso, pour-overs, cold brews — crafted with care by certified baristas.",
    emoji: "☕",
    banner: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&h=400&fit=crop",
    isOpen: false,
    closedNote: "Closed for Poya Day — back tomorrow!",
    prepTime: "6 min",
    rating: 4.7,
    reviewCount: 296,
    tags: ["Coffee", "Beverages", "Vegetarian"],
    categories: ["Coffee", "Drinks"],
    paymentLink: "https://pay.example/brewlab",
    letterCode: "B",
  },
];

// ---------------------------------------------------------------------------
// MOCK MENU ITEMS
// TODO: Replace with Supabase query — SELECT * FROM menu_items WHERE shop_id = ? AND is_available = true
// ---------------------------------------------------------------------------
export const mockItems: MenuItem[] = [
  {
    id: "i1",
    shopId: "desi",
    title: "Egg Fried Rice",
    description: "Wok-tossed basmati with egg, leeks and carrot. Served piping hot.",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop",
    price: 450,
    category: "Rice & Meals",
    dietaryTags: ["Halal"],
    estimatedPrepTime: "12 min",
    availableSlots: ["11:00 AM - 4:00 PM"],
    maxPerOrder: 5,
    isAvailable: true,
    badge: "🏆 Most Ordered",
    popular: true,
    searchKeywords: ["fried rice", "rice", "lunch", "egg"],
  },
  {
    id: "i2",
    shopId: "desi",
    title: "Chicken Kottu",
    description: "Chopped godhamba roti stir-fried with chicken, egg, spices and leeks.",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop",
    price: 580,
    category: "Rice & Meals",
    dietaryTags: ["Halal"],
    estimatedPrepTime: "15 min",
    availableSlots: ["11:00 AM - 4:00 PM"],
    maxPerOrder: 3,
    isAvailable: true,
    popular: false,
    searchKeywords: ["koththu", "kottu", "spicy", "chicken", "dinner"],
  },
  {
    id: "i3",
    shopId: "juice",
    title: "Mango Juice",
    description: "Fresh Karuthakolomban mango, no added sugar. Cold and refreshing.",
    image: "https://images.unsplash.com/photo-1546173159-315724a31696?w=400&h=300&fit=crop",
    price: 280,
    category: "Juice",
    dietaryTags: ["Vegan", "Gluten-Free"],
    estimatedPrepTime: "3 min",
    isAvailable: true,
    badge: "🔥 Popular",
    popular: true,
    searchKeywords: ["mango", "juice", "drink", "cold"],
  },
  {
    id: "i4",
    shopId: "brew",
    title: "Iced Latte",
    description: "Double shot espresso over ice with full-cream milk. Bold and creamy.",
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop",
    price: 380,
    category: "Coffee",
    dietaryTags: ["Vegetarian"],
    estimatedPrepTime: "6 min",
    isAvailable: false, // Shop is closed
    popular: false,
    searchKeywords: ["coffee", "latte", "iced", "caffeine"],
  },
  {
    id: "i5",
    shopId: "rocky",
    title: "Yogurt Drink",
    description: "Cool, creamy curd lassi with a hint of mint. Made fresh every hour.",
    image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop",
    price: 220,
    category: "Drinks",
    dietaryTags: ["Vegetarian", "Gluten-Free"],
    estimatedPrepTime: "3 min",
    isAvailable: true,
    badge: "🏆 Fan Favourite",
    popular: true,
    searchKeywords: ["yogurt", "curd", "lassi", "drink", "mint"],
  },
  {
    id: "i6",
    shopId: "rocky",
    title: "Milk Toffee Box",
    description: "Hand-cut classic Sri Lankan milk toffee. 12 pieces per box.",
    image: "https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=400&h=300&fit=crop",
    price: 320,
    category: "Desserts",
    dietaryTags: ["Vegetarian"],
    estimatedPrepTime: "5 min",
    isAvailable: true,
    popular: false,
    searchKeywords: ["toffee", "sweet", "milk", "dessert"],
  },
  {
    id: "i7",
    shopId: "snack",
    title: "Veg Samosa (3pc)",
    description: "Golden, flaky pastry with spiced potato and pea filling.",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop",
    price: 180,
    category: "Snacks",
    dietaryTags: ["Vegan"],
    estimatedPrepTime: "4 min",
    isAvailable: true,
    badge: "🔥 Hot & Fresh",
    popular: true,
    searchKeywords: ["samosa", "short eats", "snacks", "veg"],
  },
  {
    id: "i8",
    shopId: "snack",
    title: "Fish Cutlets (4pc)",
    description: "Crispy fish cutlets with a spiced potato filling. Served with chilli sauce.",
    image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=400&h=300&fit=crop",
    price: 240,
    category: "Snacks",
    dietaryTags: [],
    estimatedPrepTime: "4 min",
    isAvailable: true,
    popular: false,
    searchKeywords: ["cutlet", "fish", "short eats", "snacks"],
  },
  {
    id: "i9",
    shopId: "juice",
    title: "Watermelon Cooler",
    description: "Chilled watermelon blend with lime and chia seeds. Summer in a cup.",
    image: "https://images.unsplash.com/photo-1568909344668-6f14a07b56a0?w=400&h=300&fit=crop",
    price: 260,
    category: "Juice",
    dietaryTags: ["Vegan", "Gluten-Free"],
    estimatedPrepTime: "3 min",
    isAvailable: true,
    popular: false,
    searchKeywords: ["watermelon", "juice", "drink", "cold"],
  },
  {
    id: "i10",
    shopId: "desi",
    title: "Dhal Curry Plate",
    description: "Red lentil dhal with steamed rice, pol sambol and papadom.",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop",
    price: 350,
    category: "Rice & Meals",
    dietaryTags: ["Vegan", "Gluten-Free"],
    estimatedPrepTime: "10 min",
    availableSlots: ["11:00 AM - 4:00 PM"],
    isAvailable: true,
    popular: false,
    searchKeywords: ["dhal", "rice", "curry", "lunch", "vegan"],
  },
];

// ---------------------------------------------------------------------------
// MOCK CATEGORIES
// TODO: Replace with Supabase query — SELECT DISTINCT category FROM menu_items
// ---------------------------------------------------------------------------
export const mockCategories = [
  { id: "rice", label: "Rice & Meals", emoji: "🍛" },
  { id: "drinks", label: "Drinks", emoji: "🥤" },
  { id: "snacks", label: "Snacks", emoji: "🥟" },
  { id: "desserts", label: "Desserts", emoji: "🍡" },
  { id: "juice", label: "Juice", emoji: "🍹" },
  { id: "coffee", label: "Coffee", emoji: "☕" },
];

// ---------------------------------------------------------------------------
// MOCK ORDERS (for vendor dashboard)
// TODO: Replace with Supabase real-time subscription — channel: orders
// ---------------------------------------------------------------------------
export const mockOrders = [
  {
    id: "ORD-A7K9",
    code: "A7K9",
    items: ["2× Egg Fried Rice", "1× Mango Juice"],
    total: 1180,
    status: "new" as OrderStatus,
    time: "2 min ago",
    note: "Extra spicy please",
    shopId: "desi",
    pickupTime: "ASAP",
  },
  {
    id: "ORD-B3M2",
    code: "B3M2",
    items: ["1× Chicken Kottu"],
    total: 580,
    status: "preparing" as OrderStatus,
    time: "8 min ago",
    shopId: "desi",
    pickupTime: "ASAP",
  },
  {
    id: "ORD-C9X1",
    code: "C9X1",
    items: ["3× Yogurt Drink"],
    total: 660,
    status: "ready" as OrderStatus,
    time: "12 min ago",
    shopId: "rocky",
    pickupTime: "+15 min",
  },
  {
    id: "ORD-D4P7",
    code: "D4P7",
    items: ["1× Egg Fried Rice", "2× Mango Juice"],
    total: 1010,
    status: "preparing" as OrderStatus,
    time: "5 min ago",
    note: "No onions on the rice",
    shopId: "desi",
    pickupTime: "+30 min",
  },
  {
    id: "ORD-E2R8",
    code: "E2R8",
    items: ["4× Veg Samosa"],
    total: 720,
    status: "new" as OrderStatus,
    time: "1 min ago",
  },
];

// ---------------------------------------------------------------------------
// ORDER CODE GENERATION UTILITIES
// ---------------------------------------------------------------------------

/** Get or create today's order counter from localStorage */
export function getNextOrderCode(): string {
  const todayKey = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const storageKey = "edge-order-counter";
  let counter = 1;
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || "{}");
    if (stored.date === todayKey) {
      counter = (stored.count || 0) + 1;
    }
    localStorage.setItem(storageKey, JSON.stringify({ date: todayKey, count: counter }));
  } catch {
    localStorage.setItem(storageKey, JSON.stringify({ date: todayKey, count: counter }));
  }
  return String(counter).padStart(4, "0");
}

/** Generate a unique reference number for an order
 *  Format: #[ShopLetter][RandomLetter][DDMM][HHMM][OrderCode]
 *  Example: #RF0305 14320001
 */
export function generateReferenceNumber(shopLetterCode: string, orderCode: string): string {
  const randomLetter = "ABCDEFGHJKLMNPQRSTUVWXYZ"[Math.floor(Math.random() * 23)];
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  return `#${shopLetterCode}${randomLetter}${dd}${mm}${hh}${min}${orderCode}`;
}

/** Format time as HH.MM (24-hour) */
export function formatOrderTime(date: Date): string {
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${hh}.${min}`;
}

// Per-shop order type used in order history
export type PerShopOrder = {
  id: string;
  orderCode: string;
  referenceNumber: string;
  shopId: string;
  shopName: string;
  shopEmoji: string;
  shopBanner?: string;
  customerName: string;
  items: { item: MenuItem; qty: number; notes?: string; dining: string }[];
  total: number;
  orderTime: string;
  status: string;
  placedAt: string;
  slot: string;
  note?: string;
};

export const mockUserOrders: PerShopOrder[] = [
  {
    id: "ORD-1A",
    orderCode: "0001",
    referenceNumber: "#DK03051430 0001",
    shopId: "desi",
    shopName: "Desi Palace",
    shopEmoji: "🍛",
    shopBanner: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=400&fit=crop",
    customerName: "Wenuja",
    items: [{ item: mockItems[0], qty: 1, dining: "takeaway" }],
    total: 450,
    orderTime: "14.30",
    status: "completed",
    placedAt: new Date().toISOString(),
    slot: "ASAP",
  },
  {
    id: "ORD-1B",
    orderCode: "0002",
    referenceNumber: "#DM01051215 0002",
    shopId: "desi",
    shopName: "Desi Palace",
    shopEmoji: "🍛",
    shopBanner: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=400&fit=crop",
    customerName: "Wenuja",
    items: [{ item: mockItems[1], qty: 1, dining: "dine-in" }],
    total: 580,
    orderTime: "12.15",
    status: "completed",
    placedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    slot: "ASAP",
  },
  {
    id: "ORD-2A",
    orderCode: "0003",
    referenceNumber: "#JN28041030 0003",
    shopId: "juice",
    shopName: "Juice Hub",
    shopEmoji: "🥤",
    shopBanner: "https://images.unsplash.com/photo-1546173159-315724a31696?w=800&h=400&fit=crop",
    customerName: "Wenuja",
    items: [{ item: mockItems[2], qty: 2, dining: "takeaway" }],
    total: 560,
    orderTime: "10.30",
    status: "completed",
    placedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    slot: "+15 min",
  },
  {
    id: "ORD-3A",
    orderCode: "0004",
    referenceNumber: "#RH21040900 0004",
    shopId: "rocky",
    shopName: "Rocky Sweats",
    shopEmoji: "🍡",
    shopBanner: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=400&fit=crop",
    customerName: "Wenuja",
    items: [{ item: mockItems[4], qty: 1, dining: "dine-in" }],
    total: 220,
    orderTime: "09.00",
    status: "completed",
    placedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    slot: "ASAP",
  },
  {
    id: "ORD-4A",
    orderCode: "0005",
    referenceNumber: "#SA13041545 0005",
    shopId: "snack",
    shopName: "Short Eats Co.",
    shopEmoji: "🥟",
    shopBanner: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&h=400&fit=crop",
    customerName: "Wenuja",
    items: [{ item: mockItems[6], qty: 3, dining: "takeaway" }],
    total: 540,
    orderTime: "15.45",
    status: "completed",
    placedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
    slot: "ASAP",
  },
  {
    id: "ORD-5A",
    orderCode: "0006",
    referenceNumber: "#DB19030830 0006",
    shopId: "desi",
    shopName: "Desi Palace",
    shopEmoji: "🍛",
    shopBanner: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=400&fit=crop",
    customerName: "Wenuja",
    items: [{ item: mockItems[0], qty: 1, dining: "takeaway" }],
    total: 450,
    orderTime: "08.30",
    status: "completed",
    placedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
    slot: "ASAP",
  },
];

// ---------------------------------------------------------------------------
// MOCK ANALYTICS (for vendor analytics page)
// TODO: Replace with Supabase aggregation queries
// ---------------------------------------------------------------------------
export const mockAnalytics = {
  todayRevenue: 12480,
  todayOrders: 42,
  peakHour: "12:30 PM",
  peakOrderCount: 32,
  weekRevenue: 68400,
  monthRevenue: 287600,

  bestSellers: [
    { name: "Egg Fried Rice", sold: 40, revenue: 18000 },
    { name: "Chicken Kottu", sold: 33, revenue: 19140 },
    { name: "Dhal Curry Plate", sold: 26, revenue: 9100 },
    { name: "Fish Cutlets (4pc)", sold: 18, revenue: 4320 },
  ],

  hourlyOrders: [
    { hour: "8 AM", orders: 5 },
    { hour: "9 AM", orders: 12 },
    { hour: "10 AM", orders: 18 },
    { hour: "11 AM", orders: 32 },
    { hour: "12 PM", orders: 45 },
    { hour: "1 PM", orders: 38 },
    { hour: "2 PM", orders: 22 },
    { hour: "3 PM", orders: 15 },
    { hour: "4 PM", orders: 20 },
    { hour: "5 PM", orders: 18 },
    { hour: "6 PM", orders: 10 },
    { hour: "7 PM", orders: 6 },
  ],

  revenueBreakdown: [
    { name: "Rice & Meals", value: 8200 },
    { name: "Drinks", value: 2480 },
    { name: "Snacks", value: 1800 },
  ],
};

// ---------------------------------------------------------------------------
// HELPER FUNCTIONS
// ---------------------------------------------------------------------------
export const shopBySlug = (slug: string) => mockShops.find((s) => s.slug === slug);
export const shopById = (id: string) => mockShops.find((s) => s.id === id);
export const itemsByShop = (shopId: string) => mockItems.filter((i) => i.shopId === shopId);
export const itemById = (id: string) => mockItems.find((i) => i.id === id);
