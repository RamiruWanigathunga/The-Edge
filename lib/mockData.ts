// Mock Data — The Edge
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
  | "paid"
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
// DATA STORAGE (Empty - replaced by Supabase)
// ---------------------------------------------------------------------------
export const mockShops: Shop[] = [];
export const mockItems: MenuItem[] = [];
export const mockCategories: { id: string; label: string; emoji: string }[] = [];
export const mockOrders: any[] = [];

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
 *  Format: [ShopLetter][RandomLetter] [DDMM] [DDMMYY] [OrderCode]
 *  Display: #RF 1203 020526 0001
 *  Stored without # so URLs stay clean. The # is added for display only.
 */
export function generateReferenceNumber(shopLetterCode: string, orderCode: string): string {
  const randomLetter = "ABCDEFGHJKLMNPQRSTUVWXYZ"[Math.floor(Math.random() * 23)];
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yy = String(now.getFullYear()).slice(-2);
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  return `${shopLetterCode}${randomLetter} ${hh}${min} ${dd}${mm}${yy} ${orderCode}`;
}

/** Format a reference number for display with # prefix */
export function displayReferenceNumber(ref: string): string {
  return `#${ref}`;
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

export const mockUserOrders: any[] = [];

// ---------------------------------------------------------------------------
// ANALYTICS STORAGE (Empty)
// ---------------------------------------------------------------------------
export const mockAnalytics = null;

// ---------------------------------------------------------------------------
// HELPER FUNCTIONS
// ---------------------------------------------------------------------------
export const shopBySlug = (slug: string) => null;
export const shopById = (id: string) => null;
export const itemsByShop = (shopId: string) => [];
export const itemById = (id: string) => null;
