"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { PWABanner } from "@/components/layout/PWABanner";
import { ShopCard } from "@/components/shop/ShopCard";
import { FoodCard } from "@/components/shop/FoodCard";
import { useMenuItems, useServerFavorites, useShops, useSupabaseUser } from "@/lib/supabase/hooks";
import { useProfile } from "@/store/profile";
import { NotificationLink } from "@/components/layout/NotificationLink";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { data: shops = [] } = useShops();
  const { data: items = [] } = useMenuItems();
  const { data: user } = useSupabaseUser();
  const { data: favorites = [] } = useServerFavorites(user?.id);
  const { name } = useProfile();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning,";
    if (hour < 17) return "Good Afternoon,";
    return "Good Evening,";
  }, []);

  const shopNames = useMemo(
    () => new Map(shops.map((shop) => [shop.id, shop.name])),
    [shops]
  );

  const mostOrdered = useMemo(() => items.filter((i) => i.popular && i.isAvailable), [items]);
  const recentlyOrdered = useMemo(() => items.slice(0, 6), [items]); 
  const todaysShops = useMemo(
    () => [...shops].sort((a, b) => Number(b.isOpen) - Number(a.isOpen)),
    [shops]
  );
  
  const favouriteItems = useMemo(() => items.filter((i) => favorites.includes(i.id)), [items, favorites]);

  const hasFavorites = favouriteItems.length > 0;

  return (
    <div className="flex-1 bg-background">
      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-6 pb-2 md:pt-28 md:pb-8">
        <div className="container mx-auto px-4">
          <div className="animate-fade-up">
            {/* Profile Greeting */}
            <div className="flex items-center justify-between mb-8 md:hidden">
              <div>
                <div className="text-[13px] text-muted-foreground font-medium">{greeting}</div>
                <div className="text-lg font-semibold leading-tight text-foreground">{name.split(' ')[0]}</div>
              </div>
              <NotificationLink className="w-7 h-7 hover:opacity-80" iconClassName="w-6 h-6" />
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight leading-[1.1] mb-6">
              Feeling hungry?<br />
              Order ahead. Skip the queue.
            </h1>

            {/* Vendors Section */}
            <div className="mb-4 flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex -space-x-2">
                {shops.length > 0 ? shops.filter(s => s.isOpen).slice(0, 5).map((s, idx) => (
                  <div
                    key={s.id || idx}
                    className="w-8 h-8 rounded-full bg-secondary border-2 border-background grid place-items-center text-sm relative z-10"
                  >
                    {s.emoji || ["🍡", "🍛", "🥤", "🥟", "🍩"][idx % 5]}
                  </div>
                )) : ["🍡", "🍛", "🥤", "🥟", "🍩"].map((emoji, idx) => (
                  <div
                    key={idx}
                    className="w-8 h-8 rounded-full bg-secondary border-2 border-background grid place-items-center text-sm relative z-10"
                  >
                    {emoji}
                  </div>
                ))}
              </div>
              <span>
                <span className="font-semibold text-foreground">{shops.length > 0 ? shops.filter(s => s.isOpen).length : 5} vendors</span> serving today
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── SEARCH ── */}
      <section className="container mx-auto px-4 pb-4" id="search-section">
        <div className="relative max-w-3xl mx-auto">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            id="home-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && query.trim()) {
                router.push(`/browse?q=${encodeURIComponent(query.trim())}`);
              }
            }}
            placeholder="Search food, drinks, or shops…"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            className="w-full pl-12 pr-5 py-4 rounded-full bg-secondary border border-transparent focus:border-black dark:focus:border-white focus:bg-background transition-smooth focus-dashed text-sm placeholder:text-muted-foreground outline-none"
          />
        </div>
      </section>

      {/* ── SHOPS ── */}
      <section id="shops" className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Today&apos;s shops</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto snap-x scrollbar-hide -mx-4 pt-2 pb-8 scroll-pl-4 scroll-pr-4">
          {todaysShops.map((s, index) => (
            <div key={s.id} className={`w-[260px] shrink-0 snap-start ${index === 0 ? 'ml-4' : ''} ${index === todaysShops.length - 1 ? 'mr-4' : ''}`}>
              <ShopCard shop={s} />
            </div>
          ))}
        </div>
      </section>

      {/* ── FAVOURITES (Conditional) ── */}
      {hasFavorites && (
        <section className="container mx-auto px-4 py-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Your favourites</h2>
            </div>
            <Link
              href="/favorites"
              className="pill bg-secondary text-muted-foreground text-xs font-medium px-4 py-1.5 hover:bg-secondary/80 transition-smooth focus-dashed"
            >
              View all
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto snap-x scrollbar-hide -mx-4 pt-2 pb-8 scroll-pl-4 scroll-pr-4">
            {favouriteItems.map((item, index) => (
              <div key={item.id} className={`w-[200px] md:w-[240px] shrink-0 snap-start ${index === 0 ? 'ml-4' : ''} ${index === favouriteItems.length - 1 ? 'mr-4' : ''}`}>
                <FoodCard item={item} shopName={shopNames.get(item.shopId)} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── MOST ORDERED ── */}
      {mostOrdered.length > 0 && (
        <section className="container mx-auto px-4 py-8">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">Most ordered today</h2>

          <div className="flex gap-4 overflow-x-auto snap-x scrollbar-hide -mx-4 pt-2 pb-8 scroll-pl-4 scroll-pr-4">
            {mostOrdered.map((item, index) => (
              <div key={item.id} className={`w-[200px] md:w-[240px] shrink-0 snap-start ${index === 0 ? 'ml-4' : ''} ${index === mostOrdered.length - 1 ? 'mr-4' : ''}`}>
                <FoodCard item={item} shopName={shopNames.get(item.shopId)} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── RECENTLY ORDERED ── */}
      {recentlyOrdered.length > 0 && (
        <section className="container mx-auto px-4 py-8 mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">Recently ordered</h2>
          <div className="flex gap-4 overflow-x-auto snap-x scrollbar-hide -mx-4 pt-2 pb-8 scroll-pl-4 scroll-pr-4">
            {recentlyOrdered.map((item, index) => (
              <div key={item.id} className={`w-[200px] md:w-[240px] shrink-0 snap-start ${index === 0 ? 'ml-4' : ''} ${index === recentlyOrdered.length - 1 ? 'mr-4' : ''}`}>
                <FoodCard item={item} shopName={shopNames.get(item.shopId)} />
              </div>
            ))}
          </div>
        </section>
      )}
      <PWABanner />
    </div>
  );
}
