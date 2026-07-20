"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Heart, Plus } from "lucide-react";
import { toast } from "sonner";
import { MenuItem } from "@/lib/mockData";
import { useCart } from "@/store/cart";
import { useServerFavorites, useShopById, useSupabaseUser, useToggleFavorite } from "@/lib/supabase/hooks";

interface FoodCardProps {
  item: MenuItem;
  compact?: boolean;
  shopName?: string;
}

export const FoodCard = ({ item, compact = false, shopName }: FoodCardProps) => {
  const { add } = useCart();
  const { data: user } = useSupabaseUser();
  const userId = user?.id;
  const { data: favorites = [] } = useServerFavorites(userId);
  const toggleFavorite = useToggleFavorite();
  const serverFav = favorites.includes(item.id);
  const [optimisticFav, setOptimisticFav] = useState<boolean | null>(null);
  const fav = optimisticFav ?? serverFav;
  const { data: shop } = useShopById(item.shopId);

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
    <article className="group relative transition-smooth hover:shadow-elevated rounded-3xl cursor-default">
      <div className="relative rounded-3xl bg-card border border-border overflow-hidden h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted flex-shrink-0">
          <Image
            src={item.image}
            alt={item.title}
            fill
            draggable={false}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-smooth group-hover:scale-[1.04] will-change-transform"
          />

          {/* Badges removed per user request */}
          {!item.isAvailable && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm grid place-items-center">
              <span className="pill bg-muted text-muted-foreground text-xs font-medium px-3 py-1.5">
                Unavailable
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          <div className="min-w-0 mb-3">
            <div className="flex items-start gap-2">
              <h3 className="min-w-0 flex-1 font-bold text-base tracking-tight truncate leading-tight">{item.title}</h3>
              <button
                id={`fav-btn-${item.id}`}
                onClick={handleFavorite}
                disabled={toggleFavorite.isPending}
                aria-label={fav ? "Remove from favorites" : "Add to favorites"}
                className="w-7 h-7 rounded-full grid place-items-center focus-dashed transition-smooth hover:bg-secondary disabled:opacity-60 shrink-0"
              >
                <Heart
                  className={`w-4 h-4 ${
                    fav ? "fill-red-500 text-red-500" : "text-muted-foreground"
                  }`}
                />
              </button>
            </div>
            {(shopName || shop) && (
              <p className="text-sm text-muted-foreground mt-0.5 truncate">{shopName ?? shop?.name}</p>
            )}
          </div>

          <div className="flex items-center justify-between mt-auto">
            <div className="font-bold text-xl tracking-tight">
              Rs {item.price.toFixed(0)}
            </div>
            
            <button
              id={`add-to-cart-${item.id}`}
              onClick={() => {
                if (!item.isAvailable) return;
                add(item);
                toast.success(`${item.title} added to cart`);
              }}
              disabled={!item.isAvailable}
              className="w-10 h-10 md:w-8 md:h-8 rounded-full bg-[#3AD07A] dark:bg-[#2DAA63] text-white grid place-items-center hover:scale-105 transition-smooth shadow-sm focus-dashed disabled:opacity-50 disabled:cursor-not-allowed shrink-0 cursor-pointer"
            >
              <Plus className="w-6 h-6 md:w-5 md:h-5 stroke-[3px]" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
