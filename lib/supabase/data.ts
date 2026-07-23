import {
  type MenuItem,
  type OrderStatus,
  type Shop,
} from "@/lib/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type ShopRow = {
  id: string;
  owner_id: string | null;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  emoji: string | null;
  banner_url: string | null;
  logo_url: string | null;
  is_open: boolean;
  closed_note: string | null;
  prep_time_minutes: number;
  rating: number;
  review_count: number;
  tags: string[] | null;
  categories: string[] | null;
  payment_link: string | null;
  letter_code: string | null;
  is_approved?: boolean;
  status?: string;
  available_time_slots: Record<string, string[]> | null;
  opening_time?: string | null;
  closing_time?: string | null;
};

type MenuItemRow = {
  id: string;
  shop_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  price_lkr: number;
  discount_lkr: number | null;
  category: string;
  dietary_tags: string[] | null;
  estimated_prep_time_minutes: number;
  available_slots: string[] | null;
  max_per_order: number | null;
  is_available: boolean;
  badge: string | null;
  is_popular: boolean;
  search_keywords: string[] | null;
  item_time_slots: Record<string, string[]> | null;
};

type OrderItemRow = {
  id: string;
  item_title: string;
  item_image_url: string | null;
  quantity: number;
  unit_price_lkr: number;
  notes: string | null;
  dining: string;
};

type OrderWithItemsRow = {
  id: string;
  daily_code: string;
  reference_number: string;
  status: OrderStatus;
  total_amount_lkr: number;
  pickup_time: string | null;
  scheduled_slot: string;
  note: string | null;
  customer_name: string;
  created_at: string;
  shop_id: string;
  order_items: OrderItemRow[];
  shops?: {
    name: string;
    emoji: string | null;
    banner_url: string | null;
  };
};

export type VendorOrder = {
  id: string;
  code: string;
  referenceNumber: string;
  items: string[];
  itemDetails: Array<{
    title: string;
    quantity: number;
    unitPrice: number;
    notes?: string;
    dining: string;
    imageUrl?: string;
  }>;
  total: number;
  status: OrderStatus;
  time: string;
  note?: string;
  shopId: string;
  pickupTime: string;
  scheduledSlot: string;
  customerName: string;
  createdAt: string;
};

export type LiveOrder = {
  id: string;
  code: string;
  referenceNumber: string;
  status: OrderStatus;
  total: number;
  pickupTime: string;
  scheduledSlot: string;
  note?: string;
  createdAt: string;
  customerName: string;
  shopName: string;
  shopEmoji: string;
  shopBanner?: string;
  shopId: string;
  items: Array<{
    id: string;
    title: string;
    quantity: number;
    unitPrice: number;
    notes?: string;
    dining: string;
    imageUrl?: string;
  }>;
};

const fallbackImage = "/icons/icon-512.png";

export function isSupabaseConfigured() {
  return true;
}

function checkIsCurrentlyOpen(isOpen: boolean, openingTime?: string | null, closingTime?: string | null): boolean {
  if (!isOpen) return false;
  if (!openingTime || !closingTime) return isOpen;
  
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  const [openH, openM] = openingTime.split(":").map(Number);
  const [closeH, closeM] = closingTime.split(":").map(Number);
  
  const startMinutes = openH * 60 + (openM || 0);
  const endMinutes = closeH * 60 + (closeM || 0);
  
  if (endMinutes >= startMinutes) {
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  } else {
    return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
  }
}

function mapShop(row: ShopRow): Shop {
  const isCurrentlyOpen = checkIsCurrentlyOpen(row.is_open, row.opening_time, row.closing_time);
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline ?? "",
    description: row.description ?? "",
    emoji: row.emoji ?? "🍽️",
    banner: row.banner_url ?? undefined,
    logo: row.logo_url ?? undefined,
    isOpen: isCurrentlyOpen,
    closedNote: row.closed_note || (!isCurrentlyOpen ? "Closed outside operating hours" : undefined),
    prepTime: `${row.prep_time_minutes} min`,
    rating: Number(row.rating),
    reviewCount: row.review_count,
    tags: row.tags ?? [],
    categories: row.categories ?? [],
    paymentLink: row.payment_link ?? undefined,
    ownerId: row.owner_id ?? undefined,
    letterCode: row.letter_code ?? row.name.charAt(0).toUpperCase(),
    openingTime: row.opening_time ?? "08:00",
    closingTime: row.closing_time ?? "22:00",
  };
}

function mapMenuItem(row: MenuItemRow): MenuItem {
  return {
    id: row.id,
    shopId: row.shop_id,
    title: row.title,
    description: row.description ?? "",
    image: row.image_url ?? fallbackImage,
    price: row.price_lkr,
    discount: row.discount_lkr ?? undefined,
    category: row.category,
    dietaryTags: row.dietary_tags ?? [],
    estimatedPrepTime: `${row.estimated_prep_time_minutes} min`,
    availableSlots: row.available_slots ?? undefined,
    maxPerOrder: row.max_per_order ?? undefined,
    isAvailable: row.is_available,
    badge: row.badge ?? undefined,
    popular: row.is_popular,
    searchKeywords: row.search_keywords ?? [],
  };
}

// ---------------------------------------------------------------------------
// SHOP QUERIES
// ---------------------------------------------------------------------------

export async function fetchShops(): Promise<Shop[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("shops")
    .select("*")
    .eq("is_approved", true)
    .order("name", { ascending: true });

  if (error) throw error;
  return ((data ?? []) as ShopRow[]).map(mapShop);
}

export async function fetchMenuItems(): Promise<MenuItem[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("is_available", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return ((data ?? []) as MenuItemRow[]).map(mapMenuItem);
}

export async function fetchAllMenuItems(): Promise<MenuItem[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return ((data ?? []) as MenuItemRow[]).map(mapMenuItem);
}

export async function fetchShopBySlug(slug: string): Promise<Shop | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("shops")
    .select("*")
    .eq("slug", slug)
    .eq("is_approved", true)
    .eq("status", "approved")
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapShop(data as ShopRow);
}

export async function fetchVendorShopBySlug(slug: string, userId: string): Promise<Shop | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("shops")
    .select("*")
    .eq("slug", slug)
    .eq("owner_id", userId)
    .eq("is_approved", true)
    .eq("status", "approved")
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapShop(data as ShopRow);
}

export async function fetchMyApprovedShops(userId: string): Promise<Shop[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("shops")
    .select("*")
    .eq("owner_id", userId)
    .eq("is_approved", true)
    .eq("status", "approved")
    .order("name", { ascending: true });

  if (error) throw error;
  return ((data ?? []) as ShopRow[]).map(mapShop);
}

export async function fetchShopById(id: string): Promise<Shop | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("shops")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return mapShop(data as ShopRow);
}

export async function fetchMenuItemsByShop(shopId: string): Promise<MenuItem[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("shop_id", shopId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return ((data ?? []) as MenuItemRow[]).map(mapMenuItem);
}

export async function updateMenuItemDietaryTags(menuItemId: string, dietaryTags: string[]) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;

  const { error } = await supabase
    .from("menu_items")
    .update({ dietary_tags: dietaryTags })
    .eq("id", menuItemId);

  if (error) throw error;
}

// ---------------------------------------------------------------------------
// ORDER CREATION (via server-side RPC)
// ---------------------------------------------------------------------------

export type CreateOrderParams = {
  userId: string | null;
  shopId: string;
  total: number;
  customerName: string;
  scheduledSlot?: string;
  pickupTime?: string | null;
  note?: string;
  items: Array<{
    menu_item_id: string;
    title: string;
    image_url?: string;
    qty: number;
    price: number;
    notes?: string;
    dining: string;
  }>;
};

export type CreateOrderResult = {
  order_id: string;
  daily_code: string;
  reference_number: string;
};

export async function createOrder(params: CreateOrderParams): Promise<CreateOrderResult> {
  const response = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      shopId: params.shopId,
      total: params.total,
      customerName: params.customerName,
      scheduledSlot: params.scheduledSlot ?? "ASAP",
      note: params.note ?? null,
      items: params.items,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to create order");
  }

  return data as CreateOrderResult;
}

// ---------------------------------------------------------------------------
// ORDER QUERIES
// ---------------------------------------------------------------------------

function formatRelativeTime(value: string) {
  const diffMs = Date.now() - new Date(value.replace(" ", "T")).getTime();
  const diffMin = Math.max(0, Math.round(diffMs / 60000));
  if (diffMin < 1) return "just now";
  if (diffMin === 1) return "1 min ago";
  if (diffMin < 60) return `${diffMin} min ago`;
  return `${Math.round(diffMin / 60)} hr ago`;
}

export async function fetchVendorOrders(
  shopId: string,
  dateFilter: "today" | "week" | "month" = "today"
): Promise<VendorOrder[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];

  // Calculate date range
  const now = new Date();
  let fromDate: string;
  if (dateFilter === "today") {
    fromDate = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(); // Last 24 hours
  } else if (dateFilter === "week") {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    fromDate = d.toISOString();
  } else {
    const d = new Date(now);
    d.setMonth(d.getMonth() - 1);
    fromDate = d.toISOString();
  }

  const { data, error } = await supabase
    .from("orders")
    .select(`
      id, daily_code, reference_number, status, total_amount_lkr,
      pickup_time, scheduled_slot, note, customer_name, created_at,
      order_items(id, item_title, item_image_url, quantity, unit_price_lkr, notes, dining)
    `)
    .eq("shop_id", shopId)
    .gte("created_at", fromDate)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return ((data ?? []) as unknown as OrderWithItemsRow[]).map((row) => ({
    id: row.id,
    code: row.daily_code,
    referenceNumber: row.reference_number,
    items: (row.order_items ?? []).map((it) => `${it.quantity}× ${it.item_title}`),
    itemDetails: (row.order_items ?? []).map((it) => ({
      title: it.item_title,
      quantity: it.quantity,
      unitPrice: it.unit_price_lkr,
      notes: it.notes ?? undefined,
      dining: it.dining,
      imageUrl: it.item_image_url ?? undefined,
    })),
    total: row.total_amount_lkr,
    status: row.status,
    time: formatRelativeTime(row.created_at),
    note: row.note ?? undefined,
    shopId,
    pickupTime: row.pickup_time
      ? new Date(row.pickup_time.replace(" ", "T")).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
      : "ASAP",
    scheduledSlot: row.scheduled_slot,
    customerName: row.customer_name,
    createdAt: row.created_at.replace(" ", "T"),
  }));
}

export async function searchVendorOrders(
  shopId: string,
  query: string,
  dateFilter: "today" | "week" | "month" = "today"
): Promise<VendorOrder[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];

  const now = new Date();
  let fromDate: string;
  if (dateFilter === "today") {
    fromDate = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(); // Last 24 hours
  } else if (dateFilter === "week") {
    const d = new Date(now); d.setDate(d.getDate() - 7); fromDate = d.toISOString();
  } else {
    const d = new Date(now); d.setMonth(d.getMonth() - 1); fromDate = d.toISOString();
  }

  // Smart search: pad numeric input for daily_code matching
  const paddedQuery = /^\d+$/.test(query.trim())
    ? query.trim().padStart(4, "0")
    : query.trim();

  const { data, error } = await supabase
    .from("orders")
    .select(`
      id, daily_code, reference_number, status, total_amount_lkr,
      pickup_time, scheduled_slot, note, customer_name, created_at,
      order_items(id, item_title, item_image_url, quantity, unit_price_lkr, notes, dining)
    `)
    .eq("shop_id", shopId)
    .gte("created_at", fromDate)
    .or(`daily_code.eq.${paddedQuery},reference_number.ilike.%${paddedQuery}%,customer_name.ilike.%${query.trim()}%`)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return ((data ?? []) as unknown as OrderWithItemsRow[]).map((row) => ({
    id: row.id,
    code: row.daily_code,
    referenceNumber: row.reference_number,
    items: (row.order_items ?? []).map((it) => `${it.quantity}× ${it.item_title}`),
    itemDetails: (row.order_items ?? []).map((it) => ({
      title: it.item_title,
      quantity: it.quantity,
      unitPrice: it.unit_price_lkr,
      notes: it.notes ?? undefined,
      dining: it.dining,
      imageUrl: it.item_image_url ?? undefined,
    })),
    total: row.total_amount_lkr,
    status: row.status,
    time: formatRelativeTime(row.created_at),
    note: row.note ?? undefined,
    shopId,
    pickupTime: row.pickup_time
      ? new Date(row.pickup_time.replace(" ", "T")).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
      : "ASAP",
    scheduledSlot: row.scheduled_slot,
    customerName: row.customer_name,
    createdAt: row.created_at.replace(" ", "T"),
  }));
}

export async function fetchUserOrders(userId: string): Promise<LiveOrder[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("orders")
    .select(`
      id, daily_code, reference_number, status, total_amount_lkr,
      pickup_time, scheduled_slot, note, customer_name, created_at, shop_id,
      shops!inner(name, emoji, banner_url),
      order_items(id, item_title, item_image_url, quantity, unit_price_lkr, notes, dining)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return ((data ?? []) as unknown as OrderWithItemsRow[]).map((row) => ({
    id: row.id,
    code: row.daily_code,
    referenceNumber: row.reference_number,
    status: row.status,
    total: row.total_amount_lkr,
    pickupTime: row.pickup_time ?? "",
    scheduledSlot: row.scheduled_slot,
    note: row.note ?? undefined,
    createdAt: row.created_at.replace(" ", "T"),
    customerName: row.customer_name,
    shopName: row.shops?.name ?? "",
    shopEmoji: row.shops?.emoji ?? "🍽️",
    shopBanner: row.shops?.banner_url ?? undefined,
    shopId: row.shop_id,
    items: (row.order_items ?? []).map((it) => ({
      id: it.id,
      title: it.item_title,
      quantity: it.quantity,
      unitPrice: it.unit_price_lkr,
      notes: it.notes ?? undefined,
      dining: it.dining,
      imageUrl: it.item_image_url ?? undefined,
    })),
  }));
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;

  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) throw error;
}

export async function deleteVendorOrder(orderId: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;

  const { error } = await supabase
    .from("orders")
    .delete()
    .eq("id", orderId);

  if (error) throw error;
}

export async function updateShopHours(shopId: string, openingTime: string, closingTime: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;

  const { error } = await supabase
    .from("shops")
    .update({
      opening_time: openingTime,
      closing_time: closingTime,
    })
    .eq("id", shopId);

  if (error) throw error;
}

export async function updateShopDetails(
  shopId: string,
  updates: Partial<{
    name: string;
    tagline: string;
    description: string;
    emoji: string;
    banner_url: string | null;
    logo_url: string | null;
    is_open: boolean;
    closed_note: string | null;
    prep_time_minutes: number;
    payment_link: string | null;
    opening_time: string;
    closing_time: string;
  }>
) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;

  const { error } = await supabase
    .from("shops")
    .update(updates)
    .eq("id", shopId);

  if (error) throw error;
}

export async function createMenuItem(item: {
  shopId: string;
  title: string;
  description?: string;
  imageUrl?: string;
  priceLkr: number;
  discountLkr?: number | null;
  category: string;
  dietaryTags?: string[];
  isAvailable?: boolean;
  maxPerOrder?: number | null;
  estimatedPrepTimeMinutes?: number;
  badge?: string | null;
  isPopular?: boolean;
  searchKeywords?: string[];
}) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;

  const { error } = await supabase.from("menu_items").insert({
    shop_id: item.shopId,
    title: item.title,
    description: item.description ?? "",
    image_url: item.imageUrl ?? null,
    price_lkr: item.priceLkr,
    discount_lkr: item.discountLkr ?? null,
    category: item.category,
    dietary_tags: item.dietaryTags ?? [],
    is_available: item.isAvailable ?? true,
    max_per_order: item.maxPerOrder ?? null,
    estimated_prep_time_minutes: item.estimatedPrepTimeMinutes ?? 10,
    badge: item.badge ?? null,
    is_popular: item.isPopular ?? false,
    search_keywords: item.searchKeywords ?? [],
  });

  if (error) throw error;
}

export async function updateMenuItem(
  menuItemId: string,
  updates: Partial<{
    title: string;
    description: string;
    image_url: string | null;
    price_lkr: number;
    discount_lkr: number | null;
    category: string;
    dietary_tags: string[];
    is_available: boolean;
    max_per_order: number | null;
    estimated_prep_time_minutes: number;
    badge: string | null;
    is_popular: boolean;
    search_keywords: string[];
  }>
) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;

  const { error } = await supabase
    .from("menu_items")
    .update(updates)
    .eq("id", menuItemId);

  if (error) throw error;
}

export async function deleteMenuItem(menuItemId: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;

  await supabase.from("user_cart").delete().eq("menu_item_id", menuItemId);
  await supabase.from("user_favorites").delete().eq("menu_item_id", menuItemId);

  const { error } = await supabase
    .from("menu_items")
    .delete()
    .eq("id", menuItemId);

  if (error) {
    const { error: updateError } = await supabase
      .from("menu_items")
      .update({ is_available: false })
      .eq("id", menuItemId);

    if (updateError) throw error;
  }
}

// ---------------------------------------------------------------------------
// CART SYNC
// ---------------------------------------------------------------------------

export type ServerCartItem = {
  id: string;
  menu_item_id: string;
  shop_id: string;
  quantity: number;
  notes: string | null;
  dining: string;
  scheduled_slot: string;
};

export async function fetchServerCart(userId: string): Promise<ServerCartItem[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("user_cart")
    .select("id, menu_item_id, shop_id, quantity, notes, dining, scheduled_slot")
    .eq("user_id", userId);

  if (error) throw error;
  return (data ?? []) as ServerCartItem[];
}

export async function upsertServerCartItem(
  userId: string,
  item: { menu_item_id: string; shop_id: string; quantity: number; notes?: string; dining: string; scheduled_slot?: string }
) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;

  const { error } = await supabase
    .from("user_cart")
    .upsert(
      {
        user_id: userId,
        menu_item_id: item.menu_item_id,
        shop_id: item.shop_id,
        quantity: item.quantity,
        notes: item.notes ?? null,
        dining: item.dining,
        scheduled_slot: item.scheduled_slot ?? "ASAP",
      },
      { onConflict: "user_id,menu_item_id" }
    );

  if (error) throw error;
}

export async function removeServerCartItem(userId: string, menuItemId: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;

  const { error } = await supabase
    .from("user_cart")
    .delete()
    .eq("user_id", userId)
    .eq("menu_item_id", menuItemId);

  if (error) throw error;
}

export async function clearServerCart(userId: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;

  const { error } = await supabase
    .from("user_cart")
    .delete()
    .eq("user_id", userId);

  if (error) throw error;
}

export async function clearServerCartForShop(userId: string, shopId: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;

  const { error } = await supabase
    .from("user_cart")
    .delete()
    .eq("user_id", userId)
    .eq("shop_id", shopId);

  if (error) throw error;
}

// ---------------------------------------------------------------------------
// FAVORITES SYNC
// ---------------------------------------------------------------------------

export async function fetchServerFavorites(userId: string): Promise<string[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("user_favorites")
    .select("menu_item_id")
    .eq("user_id", userId);

  if (error) throw error;
  return (data ?? []).map((r: any) => r.menu_item_id);
}

export async function addServerFavorite(userId: string, menuItemId: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;

  const { error } = await supabase
    .from("user_favorites")
    .upsert({ user_id: userId, menu_item_id: menuItemId }, { onConflict: "user_id,menu_item_id" });

  if (error) throw error;
}

export async function removeServerFavorite(userId: string, menuItemId: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;

  const { error } = await supabase
    .from("user_favorites")
    .delete()
    .eq("user_id", userId)
    .eq("menu_item_id", menuItemId);

  if (error) throw error;
}

// ---------------------------------------------------------------------------
// SHOP REGISTRATION
// ---------------------------------------------------------------------------

export async function submitShopApplication(params: {
  userId: string;
  shopName: string;
  slug: string;
  ownerName: string;
  email: string;
  paymentLink: string;
  description: string;
  category: string;
}) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase is not configured");

  const { error } = await supabase.from("shops").insert({
    owner_id: params.userId,
    slug: params.slug,
    name: params.shopName,
    tagline: params.category || null,
    description: params.description,
    payment_link: params.paymentLink,
    categories: params.category ? [params.category] : null,
    owner_name: params.ownerName,
    contact_email: params.email,
  });

  if (error) {
    console.error("Shop application error:", error);
    throw error;
  }
}

export async function fetchShopRegistrationEnabled(): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return false;

  const { data, error } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "shop_registration_enabled")
    .maybeSingle();

  if (error) throw error;
  return data?.value === true || data?.value === "true";
}

// ---------------------------------------------------------------------------
// PROFILE
// ---------------------------------------------------------------------------

export type UserProfile = {
  id: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  totalOrders: number;
  createdAt: string;
};

export async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) return null;
  return {
    id: data.id,
    displayName: data.display_name,
    email: data.email,
    avatarUrl: data.avatar_url ?? undefined,
    totalOrders: data.total_orders,
    createdAt: data.created_at,
  };
}

export async function updateProfile(userId: string, updates: { display_name?: string; email?: string; avatar_url?: string }) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId);

  if (error) throw error;
}

// ---------------------------------------------------------------------------
// LEGACY COMPAT — kept for vendor dashboard fallback
// ---------------------------------------------------------------------------

export async function fetchOrderByCode(code: string): Promise<LiveOrder | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const padded = /^\d+$/.test(code.trim()) ? code.trim().padStart(4, "0") : code.trim();

  const { data, error } = await supabase
    .from("orders")
    .select(`
      id, daily_code, reference_number, status, total_amount_lkr,
      pickup_time, scheduled_slot, note, customer_name, created_at, shop_id,
      shops!inner(name, emoji, banner_url),
      order_items(id, item_title, item_image_url, quantity, unit_price_lkr, notes, dining)
    `)
    .or(`daily_code.eq.${padded},reference_number.eq.${code}`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    code: data.daily_code,
    referenceNumber: data.reference_number,
    status: data.status as OrderStatus,
    total: data.total_amount_lkr,
    pickupTime: data.pickup_time ?? "",
    scheduledSlot: data.scheduled_slot,
    note: data.note ?? undefined,
    createdAt: data.created_at.replace(" ", "T"),
    customerName: data.customer_name,
    shopName: (data as unknown as OrderWithItemsRow).shops?.name ?? "",
    shopEmoji: (data as unknown as OrderWithItemsRow).shops?.emoji ?? "🍽️",
    shopBanner: (data as unknown as OrderWithItemsRow).shops?.banner_url ?? undefined,
    shopId: data.shop_id,
    items: ((data as unknown as OrderWithItemsRow).order_items ?? []).map((it) => ({
      id: it.id,
      title: it.item_title,
      quantity: it.quantity,
      unitPrice: it.unit_price_lkr,
      notes: it.notes ?? undefined,
      dining: it.dining,
      imageUrl: it.item_image_url ?? undefined,
    })),
  };
}
