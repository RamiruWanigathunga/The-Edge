import {
  mockItems,
  mockShops,
  type MenuItem,
  type OrderStatus,
  type Shop,
} from "@/lib/mockData";
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
};

export type VendorOrder = {
  id: string;
  code: string;
  items: string[];
  total: number;
  status: OrderStatus;
  time: string;
  note?: string;
  shopId: string;
  pickupTime: string;
};

export type LiveOrder = {
  id: string;
  code: string;
  status: OrderStatus;
  total: number;
  pickupTime: string;
  note?: string;
  createdAt: string;
  items: Array<{
    id: string;
    title: string;
    quantity: number;
    unitPrice: number;
    notes?: string;
    dining: "dine-in" | "takeaway";
    shopId: string;
    shopPin: string;
  }>;
};

const fallbackImage = "/icons/icon-512.png";

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

function mapShop(row: ShopRow): Shop {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline ?? "",
    description: row.description ?? "",
    emoji: row.emoji ?? "🍽️",
    banner: row.banner_url ?? undefined,
    logo: row.logo_url ?? undefined,
    isOpen: row.is_open,
    closedNote: row.closed_note ?? undefined,
    prepTime: `${row.prep_time_minutes} min`,
    rating: Number(row.rating),
    reviewCount: row.review_count,
    tags: row.tags ?? [],
    categories: row.categories ?? [],
    paymentLink: row.payment_link ?? undefined,
    ownerId: row.owner_id ?? undefined,
    letterCode: row.letter_code ?? row.name.charAt(0).toUpperCase(),
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

export async function fetchShops(): Promise<Shop[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return mockShops;

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
  if (!supabase) return mockItems;

  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("is_available", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return ((data ?? []) as MenuItemRow[]).map(mapMenuItem);
}

export async function fetchShopBySlug(slug: string): Promise<Shop | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return mockShops.find((shop) => shop.slug === slug) ?? null;

  const { data, error } = await supabase
    .from("shops")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) throw error;
  return mapShop(data as ShopRow);
}

export async function fetchMenuItemsByShop(shopId: string): Promise<MenuItem[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return mockItems.filter((item) => item.shopId === shopId);

  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("shop_id", shopId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return ((data ?? []) as MenuItemRow[]).map(mapMenuItem);
}

function formatRelativeTime(value: string) {
  const diffMs = Date.now() - new Date(value).getTime();
  const diffMin = Math.max(0, Math.round(diffMs / 60000));
  if (diffMin < 1) return "just now";
  if (diffMin === 1) return "1 min ago";
  if (diffMin < 60) return `${diffMin} min ago`;
  return `${Math.round(diffMin / 60)} hr ago`;
}

export async function fetchVendorOrdersByShop(shopId: string): Promise<VendorOrder[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("order_items")
    .select(
      "shop_id,item_title,quantity,orders!inner(id,pickup_code,status,total_amount_lkr,note,pickup_time,created_at)"
    )
    .eq("shop_id", shopId);

  if (error) throw error;

  const grouped = new Map<string, VendorOrder>();

  (data ?? []).forEach((row: any) => {
    const order = row.orders;
    const current: VendorOrder = grouped.get(order.id) ?? {
      id: order.id,
      code: order.pickup_code,
      items: [],
      total: order.total_amount_lkr,
      status: order.status,
      time: formatRelativeTime(order.created_at),
      note: order.note ?? undefined,
      shopId,
      pickupTime: order.pickup_time
        ? new Date(order.pickup_time).toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          })
        : "ASAP",
    };

    current.items.push(`${row.quantity}x ${row.item_title}`);
    grouped.set(order.id, current);
  });

  return Array.from(grouped.values());
}

export async function fetchOrderByCode(code: string): Promise<LiveOrder | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("orders")
    .select(
      "id,pickup_code,status,total_amount_lkr,pickup_time,note,created_at,order_items(id,item_title,quantity,unit_price_lkr,notes,dining,shop_id,shop_pin)"
    )
    .eq("pickup_code", code)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    code: data.pickup_code,
    status: data.status,
    total: data.total_amount_lkr,
    pickupTime: data.pickup_time,
    note: data.note ?? undefined,
    createdAt: data.created_at,
    items: (data.order_items ?? []).map((item: any) => ({
      id: item.id,
      title: item.item_title,
      quantity: item.quantity,
      unitPrice: item.unit_price_lkr,
      notes: item.notes ?? undefined,
      dining: item.dining,
      shopId: item.shop_id,
      shopPin: item.shop_pin,
    })),
  };
}
