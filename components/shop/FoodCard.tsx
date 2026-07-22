"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Check, Heart, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { MenuItem } from "@/lib/types";
import { useCart } from "@/store/cart";
import { useServerFavorites, useShopById, useSupabaseUser, useToggleFavorite } from "@/lib/supabase/hooks";

interface FoodCardProps {
  item: MenuItem;
  compact?: boolean;
  shopName?: string;
}

export const FoodCard = ({ item, compact = false, shopName }: FoodCardProps) => {
  const { add, items, remove } = useCart();
  const { data: user } = useSupabaseUser();
  const userId = user?.id;
  const { data: favorites = [] } = useServerFavorites(userId);
  const toggleFavorite = useToggleFavorite();
  const serverFav = favorites.includes(item.id);
  const [optimisticFav, setOptimisticFav] = useState<boolean | null>(null);
  const [selectedQty, setSelectedQty] = useState(1);
  const fav = optimisticFav ?? serverFav;
  const { data: shop } = useShopById(item.shopId);
  const isInCart = items.some((cartItem) => cartItem.item.id === item.id);
  const dietLabel = item.dietaryTags.find((tag) => {
    const normalized = tag.toLowerCase();
    return normalized === "vegan" || normalized === "vegetarian";
  });

  useEffect(() => {
    setOptimisticFav(null);
  }, [serverFav]);

  const handleFavorite = () => {
    if (!userId) {
      toast.error("Please sign in to save favorites");
      return;
    }

    const nextFav = !fav;
    setOptimisticFav(nextFav);
    toggleFavorite.mutate(
      { userId, menuItemId: item.id, isFavorite: fav },
      {
        onSuccess: () => {
          toast(nextFav ? "Added to favorites" : "Removed from favorites");
        },
        onError: () => {
          setOptimisticFav(null);
          toast.error("Could not update favorites");
        },
      }
    );
  };

  return (
    <article className="group relative h-full min-h-[300px] transition-smooth rounded-3xl cursor-default">
      <div className="relative rounded-3xl bg-card border border-border overflow-hidden h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-[5/3] overflow-hidden bg-muted flex-shrink-0">
          <Image
            src={item.image}
            alt={item.title}
            fill
            draggable={false}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />

          {/* Badges removed per user request */}
          {!item.isAvailable && (
            <div className="absolute inset-0 bg-background/80 grid place-items-center">
              <span className="pill bg-muted text-muted-foreground text-xs font-medium px-3 py-1.5">
                Unavailable
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3 flex-1 flex flex-col">
          <div className="min-w-0 mb-2">
            <div className="flex items-start gap-2">
              <h3 className="min-w-0 flex-1 font-bold text-sm tracking-tight truncate leading-tight">{item.title}</h3>
              <button
                id={`fav-btn-${item.id}`}
                onClick={handleFavorite}
                disabled={toggleFavorite.isPending}
                aria-label={fav ? "Remove from favorites" : "Add to favorites"}
                className="w-9 h-9 rounded-full grid place-items-center focus-dashed transition-smooth hover:bg-secondary disabled:opacity-60 shrink-0"
              >
                <Heart
                  className={`w-5 h-5 ${
                    fav ? "fill-red-500 text-red-500" : "text-muted-foreground"
                  }`}
                />
              </button>
            </div>
            <div className="h-5 -mt-0.5">
              {dietLabel && (
                <span className="inline-flex w-fit rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
                  {dietLabel}
                </span>
              )}
            </div>
            {(shopName || shop) && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{shopName ?? shop?.name}</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 mt-auto pt-2">
            <div className="font-bold text-base tracking-tight leading-none">
              Rs {item.price.toFixed(0)}
            </div>
            
            <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
              <div className="flex h-8 items-center rounded-full bg-secondary text-foreground border border-border overflow-hidden">
                <button
                  type="button"
                  onClick={() => setSelectedQty((qty) => Math.max(1, qty - 1))}
                  className="w-8 sm:w-7 h-8 grid place-items-center hover:bg-background transition-smooth focus-dashed disabled:opacity-40"
                  disabled={selectedQty <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5 stroke-[3px]" />
                </button>
                <span className="min-w-6 text-center text-xs sm:text-sm font-bold">{selectedQty}</span>
                <button
                  type="button"
                  onClick={() => setSelectedQty((qty) => qty + 1)}
                  className="w-8 sm:w-7 h-8 grid place-items-center hover:bg-background transition-smooth focus-dashed"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3px]" />
                </button>
              </div>
              <button
                id={`add-to-cart-${item.id}`}
                onClick={() => {
                  if (!item.isAvailable) return;
                  if (isInCart) {
                    remove(item.id);
                    setSelectedQty(1);
                    toast.error(`${item.title} removed from cart`);
                    return;
                  }
                  add(item, selectedQty);
                  toast.success(`${selectedQty} ${item.title} added to cart`);
                }}
                disabled={!item.isAvailable}
                className={`w-8 h-8 rounded-full text-white grid place-items-center transition-colors focus-dashed disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md ${
                  isInCart ? "bg-[#3AD07A] dark:bg-[#2DAA63]" : "bg-foreground hover:bg-foreground/90 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                }`}
              >
                {isInCart ? (
                  <Check className="w-5 h-5 stroke-[3px]" />
                ) : (
                  <Plus className="w-5 h-5 stroke-[3px]" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
