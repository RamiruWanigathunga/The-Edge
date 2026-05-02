"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { useCart } from "@/store/cart";
import { shopById } from "@/lib/mockData";

export default function CartPage() {
  const { items, setQty, remove, setNotes, setDining, total, groupedByShop } = useCart();
  const router = useRouter();

  const grouped = Array.from(groupedByShop().entries());

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-20 md:pt-36 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-3xl font-bold tracking-tight">Your cart is empty</h1>
          <p className="text-muted-foreground mt-2">
            Add a few things from the menu to get started.
          </p>
          <Link
            href="/"
            className="inline-flex mt-6 pill bg-foreground text-background px-6 py-3 font-medium focus-dashed hover:bg-foreground/90 transition-smooth"
          >
            Browse food
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:pt-28 grid lg:grid-cols-[1fr_380px] gap-8">
        {/* Left: cart items */}
        <div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Cart</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Each shop prepares your items separately — you&apos;ll get a receipt per shop.
          </p>

          <div className="mt-8 space-y-6">
            {grouped.map(([shopId, list]) => {
              const shop = shopById(shopId)!;
              const subTotal = list.reduce((n, c) => n + c.qty * c.item.price, 0);

              return (
                <div key={shopId} className="rounded-3xl border border-border bg-card overflow-hidden">
                  {/* Shop header */}
                  <div className="flex items-center justify-between px-5 py-4 bg-secondary/50 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-background grid place-items-center text-xl">
                        {shop.emoji}
                      </div>
                      <div>
                        <div className="font-semibold tracking-tight">{shop.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {list.length} item{list.length > 1 ? "s" : ""} · ⏱ {shop.prepTime}
                        </div>
                      </div>
                    </div>
                    <div className="font-mono font-semibold">Rs {subTotal}</div>
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-border">
                    {list.map((c) => (
                      <div key={c.item.id} className="p-5 flex gap-4">
                        <div className="relative w-20 h-20 flex-shrink-0">
                          <Image
                            src={c.item.image}
                            alt={c.item.title}
                            fill
                            sizes="80px"
                            className="rounded-2xl object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="font-semibold truncate">{c.item.title}</div>
                              <div className="text-xs text-muted-foreground font-mono">
                                Rs {c.item.price} ea
                              </div>
                            </div>
                            <button
                              id={`remove-item-${c.item.id}`}
                              onClick={() => remove(c.item.id)}
                              className="text-muted-foreground hover:text-destructive focus-dashed p-1 transition-smooth"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Notes input */}
                          <input
                            value={c.notes ?? ""}
                            onChange={(e) => setNotes(c.item.id, e.target.value)}
                            placeholder="Add notes (e.g. extra spicy, no onions)"
                            className="mt-2 w-full text-xs px-3 py-2 rounded-xl bg-secondary placeholder:text-muted-foreground focus-dashed focus:bg-background border border-transparent focus:border-border outline-none transition-smooth"
                          />

                          {/* Dining toggle + qty stepper */}
                          <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
                            <div className="inline-flex rounded-full bg-secondary p-1 text-xs font-medium">
                              <button
                                id={`dining-takeaway-${c.item.id}`}
                                onClick={() => setDining(c.item.id, "takeaway")}
                                className={`pill px-3 py-1 transition-smooth ${
                                  c.dining === "takeaway" ? "bg-background shadow-soft" : "text-muted-foreground"
                                }`}
                              >
                                Takeaway
                              </button>
                              <button
                                id={`dining-dinein-${c.item.id}`}
                                onClick={() => setDining(c.item.id, "dine-in")}
                                className={`pill px-3 py-1 transition-smooth ${
                                  c.dining === "dine-in" ? "bg-background shadow-soft" : "text-muted-foreground"
                                }`}
                              >
                                Dine-in
                              </button>
                            </div>

                            <div className="inline-flex items-center rounded-full border border-border">
                              <button
                                id={`qty-down-${c.item.id}`}
                                onClick={() => setQty(c.item.id, c.qty - 1)}
                                className="w-9 h-9 grid place-items-center hover:bg-secondary rounded-l-full focus-dashed transition-smooth"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="font-mono font-semibold w-8 text-center text-sm">
                                {c.qty}
                              </span>
                              <button
                                id={`qty-up-${c.item.id}`}
                                onClick={() => setQty(c.item.id, c.qty + 1)}
                                className="w-9 h-9 grid place-items-center hover:bg-secondary rounded-r-full focus-dashed transition-smooth"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: order summary */}
        <aside className="lg:sticky lg:top-24 h-fit rounded-3xl border border-border bg-card p-6">
          <div className="label-mono mb-2">● Summary</div>
          <h2 className="text-xl font-bold tracking-tight mb-5">
            {grouped.length} shop{grouped.length > 1 ? "s" : ""}
          </h2>

          <div className="space-y-2 text-sm">
            {grouped.map(([id, list]) => {
              const shop = shopById(id)!;
              const sub = list.reduce((n, c) => n + c.qty * c.item.price, 0);
              return (
                <div key={id} className="flex justify-between text-muted-foreground">
                  <span>{shop.name}</span>
                  <span className="font-mono">Rs {sub}</span>
                </div>
              );
            })}
          </div>

          <div className="border-t border-border my-5" />
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="font-mono text-2xl font-bold">Rs {total()}</span>
          </div>

          <button
            id="checkout-btn"
            onClick={() => router.push("/checkout")}
            className="mt-6 w-full inline-flex items-center justify-center gap-2 pill bg-foreground text-background px-6 py-4 font-semibold hover:bg-foreground/90 transition-smooth focus-dashed shadow-pop"
          >
            Proceed to checkout <ArrowRight className="w-4 h-4" />
          </button>
          <p className="mt-3 text-[11px] text-muted-foreground text-center">
            Each shop generates its own pickup receipt.
          </p>
        </aside>
      </div>
      <Footer />
    </div>
  );
}
