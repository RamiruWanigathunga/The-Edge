"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createOrder,
  fetchAllMenuItems,
  fetchMenuItems,
  fetchMenuItemsByShop,
  fetchOrderByCode,
  fetchProfile,
  fetchMyApprovedShops,
  fetchServerFavorites,
  addServerFavorite,
  removeServerFavorite,
  fetchShopRegistrationEnabled,
  fetchShopById,
  fetchShopBySlug,
  fetchShops,
  fetchVendorShopBySlug,
  fetchUserOrders,
  fetchVendorOrders,
  searchVendorOrders,
  updateOrderStatus as updateOrderStatusFn,
  updateMenuItemDietaryTags,
  type CreateOrderParams,
} from "@/lib/supabase/data";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { OrderStatus } from "@/lib/mockData";

// ---------------------------------------------------------------------------
// SHOP HOOKS
// ---------------------------------------------------------------------------

export function useShops() {
  return useQuery({
    queryKey: ["shops"],
    queryFn: fetchShops,
  });
}

export function useMenuItems() {
  return useQuery({
    queryKey: ["menu-items"],
    queryFn: fetchMenuItems,
  });
}

export function useAllMenuItems() {
  return useQuery({
    queryKey: ["all-menu-items"],
    queryFn: fetchAllMenuItems,
  });
}

export function useShop(slug: string) {
  return useQuery({
    queryKey: ["shop", slug],
    queryFn: () => fetchShopBySlug(slug),
    enabled: Boolean(slug),
  });
}

export function useVendorShop(slug: string, userId?: string) {
  return useQuery({
    queryKey: ["vendor-shop", slug, userId],
    queryFn: () => fetchVendorShopBySlug(slug, userId!),
    enabled: Boolean(slug) && Boolean(userId),
  });
}

export function useMyApprovedShops(userId?: string) {
  return useQuery({
    queryKey: ["my-approved-shops", userId],
    queryFn: () => fetchMyApprovedShops(userId!),
    enabled: Boolean(userId),
  });
}

export function useShopRegistrationEnabled() {
  return useQuery({
    queryKey: ["shop-registration-enabled"],
    queryFn: fetchShopRegistrationEnabled,
  });
}

export function useShopById(id?: string) {
  return useQuery({
    queryKey: ["shop-by-id", id],
    queryFn: () => fetchShopById(id!),
    enabled: Boolean(id),
  });
}

export function useShopMenuItems(shopId?: string) {
  return useQuery({
    queryKey: ["shop-menu-items", shopId],
    queryFn: () => fetchMenuItemsByShop(shopId!),
    enabled: Boolean(shopId),
  });
}

export function useUpdateMenuItemDietaryTags(shopId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ menuItemId, dietaryTags }: { menuItemId: string; dietaryTags: string[] }) =>
      updateMenuItemDietaryTags(menuItemId, dietaryTags),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-menu-items", shopId] });
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
      queryClient.invalidateQueries({ queryKey: ["all-menu-items"] });
    },
  });
}

// ---------------------------------------------------------------------------
// ORDER HOOKS
// ---------------------------------------------------------------------------

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateOrderParams) => createOrder(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-orders"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-orders"] });
    },
  });
}

export function useLiveOrder(code: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["order", code],
    queryFn: () => fetchOrderByCode(code),
    enabled: Boolean(code),
    refetchInterval: 15000, // Backup polling for mobile sleep/wake
  });

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !code) return;

    const padded = /^\d+$/.test(code.trim()) ? code.trim().padStart(4, "0") : code.trim();

    const channel = supabase
      .channel(`order:${padded}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `daily_code=eq.${padded}`,
        },
        () => queryClient.invalidateQueries({ queryKey: ["order", code] })
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [code, queryClient]);

  return query;
}

export function useUserOrders(userId?: string) {
  return useQuery({
    queryKey: ["user-orders", userId],
    queryFn: () => fetchUserOrders(userId!),
    enabled: Boolean(userId),
  });
}

// ---------------------------------------------------------------------------
// VENDOR HOOKS
// ---------------------------------------------------------------------------

export function useVendorOrders(
  shopId?: string,
  dateFilter: "today" | "week" | "month" = "today"
) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["vendor-orders", shopId, dateFilter],
    queryFn: () => fetchVendorOrders(shopId!, dateFilter),
    enabled: Boolean(shopId),
    refetchInterval: 15000, // Backup polling every 15s
  });

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !shopId) return;

    const channel = supabase
      .channel(`vendor-orders:${shopId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `shop_id=eq.${shopId}`,
        },
        (payload: any) => {
          queryClient.invalidateQueries({ queryKey: ["vendor-orders", shopId] });

          // Play ping sound for new paid orders
          if (payload.eventType === "INSERT" && payload.new?.status === "paid") {
            try {
              const audio = new Audio("/sounds/ping.mp3");
              audio.volume = 0.8;
              audio.play().catch(() => {});
            } catch {}
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, shopId]);

  return query;
}

export function useVendorSearch(
  shopId?: string,
  query?: string,
  dateFilter: "today" | "week" | "month" = "today"
) {
  return useQuery({
    queryKey: ["vendor-search", shopId, query, dateFilter],
    queryFn: () => searchVendorOrders(shopId!, query!, dateFilter),
    enabled: Boolean(shopId) && Boolean(query) && query!.length > 0,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      await updateOrderStatusFn(orderId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-orders"] });
      queryClient.invalidateQueries({ queryKey: ["user-orders"] });
    },
  });
}

// ---------------------------------------------------------------------------
// FAVORITES HOOKS
// ---------------------------------------------------------------------------

export function useServerFavorites(userId?: string) {
  return useQuery({
    queryKey: ["server-favorites", userId],
    queryFn: () => fetchServerFavorites(userId!),
    enabled: Boolean(userId),
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, menuItemId, isFavorite }: { userId: string; menuItemId: string; isFavorite: boolean }) => {
      if (isFavorite) {
        await removeServerFavorite(userId, menuItemId);
      } else {
        await addServerFavorite(userId, menuItemId);
      }
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["server-favorites", userId] });
    },
  });
}

// ---------------------------------------------------------------------------
// PROFILE HOOK
// ---------------------------------------------------------------------------

export function useProfile(userId?: string) {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: () => fetchProfile(userId!),
    enabled: Boolean(userId),
  });
}

// ---------------------------------------------------------------------------
// AUTH HOOK (get current Supabase user)
// ---------------------------------------------------------------------------

export function useSupabaseUser() {
  const supabase = getSupabaseBrowserClient();

  return useQuery({
    queryKey: ["supabase-user"],
    queryFn: async () => {
      if (!supabase) return null;
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ---------------------------------------------------------------------------
// DEBOUNCED SEARCH HELPER
// ---------------------------------------------------------------------------

export function useDebouncedValue(value: string): string {
  // Simple implementation: return the value directly for SSR compat
  // The actual debouncing happens in the component that uses this
  return value;
}
