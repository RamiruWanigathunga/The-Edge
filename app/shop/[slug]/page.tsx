"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { FoodCard } from "@/components/shop/FoodCard";
import { useCart } from "@/store/cart";
import { useShop, useShopMenuItems } from "@/lib/supabase/hooks";

export default function ShopPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { data: shop, isLoading } = useShop(slug ?? "");
  const { data: items = [] } = useShopMenuItems(shop?.id);
  const cats = useMemo(() => Array.from(new Set(items.map((i) => i.category))), [items]);
  const [activeCat, setActiveCat] = useState<string>("");
  const { addRecentlyViewed } = useCart();

  // Track recently viewed
  useEffect(() => {
    if (shop) addRecentlyViewed(shop.id);
  }, [addRecentlyViewed, shop]);

  // Set first category on load
  useEffect(() => {
    if (cats.length > 0 && !activeCat) setActiveCat(cats[0]);
  }, [activeCat, cats]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
          Loading shop...
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold">Shop not found</h1>
          <p className="text-muted-foreground mt-2">
            This shop doesn&apos;t exist or may have moved.
          </p>
          <Link href="/" className="text-primary mt-4 inline-block hover:underline">
            ← Back home
          </Link>
        </div>
      </div>
    );
  }

  const visible = activeCat ? items.filter((i) => i.category === activeCat) : items;

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Banner */}
      <div className="w-full h-48 sm:h-64 relative bg-secondary border-b border-border">
        {shop.banner ? (
          <img src={shop.banner} alt={shop.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full grid place-items-center text-6xl">{shop.emoji}</div>
        )}
      </div>

      <div className="container mx-auto px-4">
        {/* Shop header */}
        <div className="mt-6 flex flex-col gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{shop.name}</h1>
            <span
              className={`pill text-[11px] font-semibold px-2.5 py-1 ${
                shop.isOpen
                  ? "bg-success-soft text-success-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {shop.isOpen ? "● OPEN" : "● CLOSED"}
            </span>
          </div>
          <p className="text-lg text-muted-foreground font-medium">{shop.tagline}</p>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed max-w-2xl">
            {shop.description}
          </p>

          {shop.closedNote && (
            <div className="mt-4 rounded-2xl bg-accent text-accent-foreground px-4 py-3 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {shop.closedNote}
            </div>
          )}
        </div>

        {/* Sticky category tabs */}
        {cats.length > 1 && (
          <div className="sticky top-16 bg-background/90 backdrop-blur-xl z-20 -mx-4 px-4 py-4 mt-8 border-b border-border">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {cats.map((c) => (
                <button
                  key={c}
                  id={`shop-cat-${c.replace(/\s+/g, "-").toLowerCase()}`}
                  onClick={() => setActiveCat(c)}
                  className={`pill px-4 py-2 text-sm font-medium whitespace-nowrap transition-smooth focus-dashed ${
                    activeCat === c
                      ? "bg-foreground text-background"
                      : "bg-secondary text-foreground hover:bg-accent"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Menu grid */}
        {items.length === 0 ? (
          <div className="text-center py-24 mt-8 rounded-[2rem] border border-dashed border-border bg-secondary/20">
            <div className="w-16 h-16 rounded-full bg-secondary grid place-items-center mx-auto mb-4">
              <span className="text-2xl">👨‍🍳</span>
            </div>
            <h2 className="text-xl font-semibold mb-2">The chef is still prepping</h2>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
              This shop hasn't added any menu items yet. Check back later for delicious food!
            </p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 lg:grid-cols-3 gap-5">
            {visible.map((i) => (
              <FoodCard key={i.id} item={i} compact />
            ))}
          </div>
        )}

        {items.length > 0 && visible.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            No items in this category.
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
