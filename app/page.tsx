"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { PWABanner } from "@/components/layout/PWABanner";
import { ShopCard } from "@/components/shop/ShopCard";
import { FoodCard } from "@/components/shop/FoodCard";
import { useMenuItems, useShops } from "@/lib/supabase/hooks";
import { useCart } from "@/store/cart";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";
import { useProfile } from "@/store/profile";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { data: shops = [] } = useShops();
  const { data: items = [] } = useMenuItems();
  const { favorites } = useCart();
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
  const recentlyOrdered = useMemo(() => items.slice(0, 6), [items]); // Mocking recently ordered for now
  const favouriteItems = useMemo(() => items.filter((i) => favorites.includes(i.id)), [items, favorites]);

  const hasFavorites = favouriteItems.length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-6 pb-2 md:pt-28 md:pb-8 bg-gradient-to-b from-[#eaf8e3] to-background dark:from-black dark:to-background">
        <div className="container mx-auto px-4">
          <div className="animate-fade-up">
            {/* Profile Greeting */}
            <div className="flex items-center gap-3 mb-8 md:hidden">
              <Link href="/profile" className="w-12 h-12 rounded-full overflow-hidden border border-border shadow-sm hover:opacity-80 transition-smooth focus-dashed">
                <ProfileAvatar className="w-full h-full" iconSize={24} />
              </Link>
              <div>
                <div className="text-[13px] text-muted-foreground font-medium">{greeting}</div>
                <div className="text-lg font-semibold leading-tight text-foreground">{name.split(' ')[0]}</div>
              </div>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight leading-[1.1] mb-6">
              Feeling hungry?<br />
              What are we cookin&apos; today?
            </h1>

            {/* Vendors Section */}
            <div className="mb-4 flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex -space-x-2">
                {shops.length > 0 ? shops.slice(0, 5).map((s, idx) => (
                  <div
                    key={s.id || idx}
                    className="w-8 h-8 rounded-full bg-secondary border-2 border-background grid place-items-center text-sm shadow-sm relative z-10"
                  >
                    {s.emoji || ["🍡", "🍛", "🥤", "🥟", "🍩"][idx % 5]}
                  </div>
                )) : ["🍡", "🍛", "🥤", "🥟", "🍩"].map((emoji, idx) => (
                  <div
                    key={idx}
                    className="w-8 h-8 rounded-full bg-secondary border-2 border-background grid place-items-center text-sm shadow-sm relative z-10"
                  >
                    {emoji}
                  </div>
                ))}
              </div>
              <span>
                <span className="font-semibold text-foreground">{shops.length > 0 ? shops.length : 5} vendors</span> serving the campus today
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
            className="w-full pl-12 pr-5 py-4 rounded-full bg-secondary border border-transparent focus:border-primary focus:bg-background transition-smooth focus-dashed text-sm placeholder:text-muted-foreground outline-none"
          />
        </div>
      </section>

      {/* ── SHOPS ── */}
      <section id="shops" className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Today&apos;s shops</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto snap-x scrollbar-hide px-4 -mx-4 pt-2 pb-8">
          {shops.map((s) => (
            <div key={s.id} className="w-[260px] shrink-0 snap-start">
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
          <div className="flex gap-4 overflow-x-auto snap-x scrollbar-hide px-4 -mx-4 pt-2 pb-8">
            {favouriteItems.map((i) => (
              <div key={i.id} className="w-[200px] md:w-[240px] shrink-0 snap-start">
                <FoodCard item={i} shopName={shopNames.get(i.shopId)} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── MOST ORDERED ── */}
      {mostOrdered.length > 0 && (
        <section className="container mx-auto px-4 py-8">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">Most ordered today</h2>
          
          <div className="flex gap-4 overflow-x-auto snap-x scrollbar-hide px-4 -mx-4 pt-2 pb-8">
            {mostOrdered.map((i) => (
              <div key={i.id} className="w-[200px] md:w-[240px] shrink-0 snap-start">
                <FoodCard item={i} shopName={shopNames.get(i.shopId)} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── RECENTLY ORDERED ── */}
      {recentlyOrdered.length > 0 && (
        <section className="container mx-auto px-4 py-8 mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">Recently ordered</h2>
          <div className="flex gap-4 overflow-x-auto snap-x scrollbar-hide px-4 -mx-4 pt-2 pb-8">
            {recentlyOrdered.map((i) => (
              <div key={i.id} className="w-[200px] md:w-[240px] shrink-0 snap-start">
                <FoodCard item={i} shopName={shopNames.get(i.shopId)} />
              </div>
            ))}
          </div>
        </section>
      )}

      <Footer />
      <PWABanner />
    </div>
  );
}
