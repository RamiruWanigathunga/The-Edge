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
  openingTime?: string;
  closingTime?: string;
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
  availableDining?: Array<"dine-in" | "takeaway">;
};

export type CartItem = {
  menuItemId: string;
  shopId: string;
  quantity: number;
  notes?: string;
  diningOption: "dine-in" | "takeaway";
};

export type OrderStatus =
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

export function displayReferenceNumber(ref: string): string {
  return ref.startsWith("#") ? ref : `#${ref}`;
}

export function formatOrderTime(date: Date): string {
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${hh}.${min}`;
}
