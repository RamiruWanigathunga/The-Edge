"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, ChevronDown } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { FoodCard } from "@/components/shop/FoodCard";
import { mockCategories } from "@/lib/mockData";
import { dietaryFilters } from "@/lib/designSystem";
import { useMenuItems, useShops } from "@/lib/supabase/hooks";

export default function BrowsePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BrowseContent />
    </Suspense>
  );
}

function BrowseContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    if (initialQuery) setQuery(initialQuery);
  }, [initialQuery]);

  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [activeDiet, setActiveDiet] = useState<string | null>(null);
  const [activeShop, setActiveShop] = useState<string | null>(null);
  const [shopOpen, setShopOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const { data: shops = [] } = useShops();
  const { data: items = [] } = useMenuItems();
  const shopNames = useMemo(
    () => new Map(shops.map((shop) => [shop.id, shop.name])),
    [shops]
  );

  const filtered = items.filter((i) => {
    const matchQ = query
      ? i.title.toLowerCase().includes(query.toLowerCase()) ||
        i.description.toLowerCase().includes(query.toLowerCase())
      : true;
    const matchC = activeCat ? i.category === activeCat : true;
    const matchD = activeDiet ? i.dietaryTags.includes(activeDiet) : true;
    const matchS = activeShop ? i.shopId === activeShop : true;
    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);
    const matchMin = !isNaN(min) ? i.price >= min : true;
    const matchMax = !isNaN(max) ? i.price <= max : true;
    return matchQ && matchC && matchD && matchS && matchMin && matchMax;
  });

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 md:pt-28">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Browse Menu</h1>
          <p className="text-muted-foreground">Discover the best food on campus.</p>
        </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar filters */}
            <aside className="w-full md:w-64 shrink-0 space-y-8">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="browse-search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search food or shop…"
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-secondary border border-transparent focus:border-primary focus:bg-background transition-smooth outline-none text-sm focus-dashed"
                />
              </div>

              {/* Shops filter */}
              <div>
                <button 
                  onClick={() => setShopOpen(!shopOpen)}
                  className="flex w-full items-center justify-between mb-4 md:pointer-events-none"
                >
                  <h3 className="label-mono mb-0">Shop</h3>
                  <ChevronDown className={`w-4 h-4 md:hidden transition-transform ${shopOpen ? "rotate-180" : ""}`} />
                </button>
                <div className={`flex-col gap-1 ${shopOpen ? "flex" : "hidden md:flex"}`}>
                  {shops.map((s) => (
                    <button
                      key={s.id}
                      id={`browse-shop-${s.id}`}
                      onClick={() => setActiveShop(activeShop === s.id ? null : s.id)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-smooth focus-dashed ${
                        activeShop === s.id
                          ? "bg-foreground text-background"
                          : "hover:bg-secondary text-foreground"
                      }`}
                    >
                      <span>{s.emoji}</span>
                      <span className="font-medium">{s.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <button 
                  onClick={() => setCatOpen(!catOpen)}
                  className="flex w-full items-center justify-between mb-4 md:pointer-events-none"
                >
                  <h3 className="label-mono mb-0">Categories</h3>
                  <ChevronDown className={`w-4 h-4 md:hidden transition-transform ${catOpen ? "rotate-180" : ""}`} />
                </button>
                <div className={`flex-col gap-1 ${catOpen ? "flex" : "hidden md:flex"}`}>
                  {mockCategories.map((c) => (
                    <button
                      key={c.id}
                      id={`browse-cat-${c.id}`}
                      onClick={() => setActiveCat(activeCat === c.label ? null : c.label)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-smooth focus-dashed ${
                        activeCat === c.label
                          ? "bg-foreground text-background"
                          : "hover:bg-secondary text-foreground"
                      }`}
                    >
                      <span>{c.emoji}</span>
                      <span className="font-medium">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dietary filters */}
              <div>
                <button 
                  onClick={() => setTagsOpen(!tagsOpen)}
                  className="flex w-full items-center justify-between mb-4 md:pointer-events-none"
                >
                  <h3 className="label-mono mb-0">Tags</h3>
                  <ChevronDown className={`w-4 h-4 md:hidden transition-transform ${tagsOpen ? "rotate-180" : ""}`} />
                </button>
                <div className={`flex-wrap gap-2 ${tagsOpen ? "flex" : "hidden md:flex"}`}>
                  {dietaryFilters.map((d) => (
                    <button
                      key={d}
                      id={`browse-diet-${d.toLowerCase()}`}
                      onClick={() => setActiveDiet(activeDiet === d ? null : d)}
                      className={`pill px-3 py-1.5 text-[11px] font-medium transition-smooth focus-dashed ${
                        activeDiet === d
                          ? "bg-success text-success-foreground"
                          : "bg-secondary hover:bg-accent"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price filter */}
              <div>
                <button 
                  onClick={() => setPriceOpen(!priceOpen)}
                  className="flex w-full items-center justify-between mb-4 md:pointer-events-none"
                >
                  <h3 className="label-mono mb-0">Price</h3>
                  <ChevronDown className={`w-4 h-4 md:hidden transition-transform ${priceOpen ? "rotate-180" : ""}`} />
                </button>
                <div className={`flex-col gap-3 ${priceOpen ? "flex" : "hidden md:flex"}`}>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-secondary border border-transparent focus:border-primary focus:bg-background transition-smooth outline-none text-sm focus-dashed"
                    />
                    <span className="text-muted-foreground">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-secondary border border-transparent focus:border-primary focus:bg-background transition-smooth outline-none text-sm focus-dashed"
                    />
                  </div>
                </div>
              </div>

              {/* Clear */}
              {(query || activeCat || activeDiet || activeShop || minPrice || maxPrice) && (
                <button
                  onClick={() => {
                    setQuery("");
                    setActiveCat(null);
                    setActiveDiet(null);
                    setActiveShop(null);
                    setMinPrice("");
                    setMaxPrice("");
                  }}
                  className="w-full pill border border-border py-2 text-sm text-muted-foreground hover:bg-secondary transition-smooth focus-dashed"
                >
                  Clear all filters
                </button>
              )}
            </aside>

            {/* Food grid */}
            <div className="flex-1">
              <div className="text-sm text-muted-foreground mb-4">
                {filtered.length} item{filtered.length !== 1 ? "s" : ""} found
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                {filtered.map((i) => (
                  <FoodCard key={i.id} item={i} shopName={shopNames.get(i.shopId)} />
                ))}
              </div>
              {filtered.length === 0 && (
                <div className="text-center py-20 text-muted-foreground bg-secondary/30 rounded-[2rem] border border-dashed border-border">
                  No items found matching your filters.
                </div>
              )}
            </div>
          </div>
      </main>

      <Footer />
    </div>
  );
}
