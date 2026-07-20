import { create } from "zustand";
import { MenuItem } from "@/lib/mockData";

export type CartEntry = {
  item: MenuItem;
  qty: number;
  notes?: string;
  dining: "dine-in" | "takeaway";
  scheduledSlot: string; // "ASAP" or a specific time slot
};

type CartState = {
  items: CartEntry[];
  favorites: string[];
  recentlyViewed: string[];
  
  // Cart Actions
  add: (
    item: MenuItem,
    qty?: number,
    opts?: { notes?: string; dining?: "dine-in" | "takeaway"; scheduledSlot?: string }
  ) => void;
  remove: (itemId: string) => void;
  setQty: (itemId: string, qty: number) => void;
  setNotes: (itemId: string, notes: string) => void;
  setDining: (itemId: string, dining: "dine-in" | "takeaway") => void;
  setScheduledSlot: (itemId: string, slot: string) => void;
  clear: () => void;
  clearShop: (shopId: string) => void;

  // Favorites Actions
  toggleFav: (itemId: string) => void;
  
  // Navigation History
  addRecentlyViewed: (shopId: string) => void;
  
  // Selectors
  count: () => number;
  total: () => number;
  groupedByShop: () => Map<string, CartEntry[]>;
};

export const useCart = create<CartState>()(
  (set, get) => ({
    items: [],
    favorites: [],
    recentlyViewed: [],

    add: (item, qty = 1, opts) => {
      const state = get();
      const existing = state.items.find((c) => c.item.id === item.id);
        
      let newItems: CartEntry[];
      if (existing) {
        newItems = state.items.map((c) =>
          c.item.id === item.id
            ? {
                ...c,
                qty: c.qty + qty,
                notes: opts?.notes ?? c.notes,
                dining: opts?.dining ?? c.dining,
                scheduledSlot: opts?.scheduledSlot ?? c.scheduledSlot,
              }
            : c
        );
      } else {
        newItems = [
          ...state.items,
          {
            item,
            qty,
            notes: opts?.notes,
            dining: opts?.dining ?? "takeaway",
            scheduledSlot: opts?.scheduledSlot ?? "ASAP",
          },
        ];
      }
        
      set({ items: newItems });
    },

    remove: (id) => {
      const state = get();
      set({ items: state.items.filter((c) => c.item.id !== id) });
    },

    setQty: (id, qty) => {
      const state = get();
      const newItems = qty <= 0
        ? state.items.filter((c) => c.item.id !== id)
        : state.items.map((c) => (c.item.id === id ? { ...c, qty } : c));
        
      set({ items: newItems });
    },

    setNotes: (id, notes) => {
      const state = get();
      const newItems = state.items.map((c) => (c.item.id === id ? { ...c, notes } : c));
      set({ items: newItems });
    },

    setDining: (id, dining) => {
      const state = get();
      const newItems = state.items.map((c) => (c.item.id === id ? { ...c, dining } : c));
      set({ items: newItems });
    },

    setScheduledSlot: (id, slot) => {
      const state = get();
      const newItems = state.items.map((c) => (c.item.id === id ? { ...c, scheduledSlot: slot } : c));
      set({ items: newItems });
    },

    clear: () => {
      set({ items: [] });
    },

    clearShop: (shopId) => {
      const state = get();
      set({ items: state.items.filter((i) => i.item.shopId !== shopId) });
    },

    toggleFav: (id) => {
      const state = get();
      const isFav = state.favorites.includes(id);
      const newFavs = isFav
        ? state.favorites.filter((f) => f !== id)
        : [...state.favorites, id];
        
      set({ favorites: newFavs });
    },

    addRecentlyViewed: (shopId) =>
      set((s) => {
        const filtered = s.recentlyViewed.filter((id) => id !== shopId);
        return { recentlyViewed: [shopId, ...filtered].slice(0, 5) };
      }),

    count: () => get().items.reduce((n, c) => n + c.qty, 0),

    total: () =>
      get().items.reduce((n, c) => n + c.qty * c.item.price, 0),

    groupedByShop: () => {
      const map = new Map<string, CartEntry[]>();
      get().items.forEach((c) => {
        const arr = map.get(c.item.shopId) ?? [];
        arr.push(c);
        map.set(c.item.shopId, arr);
      });
      return map;
    },
  })
);
