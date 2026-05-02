"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { FoodCard } from "@/components/shop/FoodCard";
import { mockItems } from "@/lib/mockData";
import { useCart } from "@/store/cart";

export default function FavoritesPage() {
  const { favorites } = useCart();
  // TODO: Replace with Supabase query for logged-in users — SELECT * FROM user_favorites WHERE user_id = auth.uid()
  const favItems = mockItems.filter((i) => favorites.includes(i.id));

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 md:pt-28">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Favorites</h1>
          <p className="text-muted-foreground">The foods you love, all in one place.</p>
        </div>

        {favItems.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {favItems.map((i) => (
              <FoodCard key={i.id} item={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 rounded-[2rem] border border-dashed border-border bg-secondary/20">
            <div className="w-16 h-16 rounded-full bg-secondary grid place-items-center mx-auto mb-4">
              <Heart className="w-6 h-6 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No favorites yet</h2>
            <p className="text-muted-foreground mb-8">
              Start exploring and save your favorite meals by tapping the heart icon.
            </p>
            <Link
              href="/browse"
              id="go-browse-btn"
              className="pill bg-primary text-primary-foreground px-8 py-3 font-medium shadow-elevated hover:bg-primary-glow transition-smooth"
            >
              Go to Browse
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
