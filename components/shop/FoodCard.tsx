"use client";

import Image from "next/image";
import { Heart, Plus } from "lucide-react";
import { toast } from "sonner";
import { MenuItem, shopById } from "@/lib/mockData";
import { useCart } from "@/store/cart";

interface FoodCardProps {
  item: MenuItem;
  compact?: boolean;
  shopName?: string;
}

export const FoodCard = ({ item, compact = false, shopName }: FoodCardProps) => {
  const { add, toggleFav, favorites } = useCart();
  const fav = favorites.includes(item.id);
  const shop = shopById(item.shopId);

  return (
    <article className="group relative transition-smooth hover:shadow-elevated rounded-3xl">
      <div className="relative rounded-3xl bg-card border border-border overflow-hidden h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted flex-shrink-0">
          <Image
            src={item.image}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-smooth group-hover:scale-[1.04] will-change-transform"
          />

          {/* Fav button */}
          <button
            id={`fav-btn-${item.id}`}
            onClick={(e) => {
              e.preventDefault();
              toggleFav(item.id);
              toast(fav ? "Removed from favorites" : "Added to favorites");
            }}
            aria-label={fav ? "Remove from favorites" : "Add to favorites"}
            className="absolute top-3 right-3 w-9 h-9 rounded-full glass-light grid place-items-center focus-dashed transition-smooth hover:scale-110"
          >
            <Heart
              className={`w-4 h-4 ${
                fav ? "fill-destructive text-destructive" : "text-white"
              }`}
            />
          </button>

          {/* Badges */}
          {item.badge && (
            <span className="absolute top-3 left-3 pill text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 bg-foreground text-background">
              {item.badge}
            </span>
          )}
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
            <h3 className="font-bold text-base tracking-tight truncate leading-tight">{item.title}</h3>
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
              className="w-10 h-10 md:w-8 md:h-8 rounded-full bg-[#D4FF00] text-black grid place-items-center hover:scale-105 transition-smooth shadow-sm focus-dashed disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              <Plus className="w-6 h-6 md:w-5 md:h-5 stroke-[3px]" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
