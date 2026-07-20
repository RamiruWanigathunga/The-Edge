"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ArrowRight, Clock, AlertCircle } from "lucide-react";
import { useCart, CartEntry } from "@/store/cart";
import { useShops } from "@/lib/supabase/hooks";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const pickupSlots = ["ASAP", "+15 min", "+30 min", "+1 hr", "+2 hr"];

export default function CartPage() {
  const { items, setQty, remove, setNotes, setDining, setScheduledSlot, total, groupedByShop } = useCart();
  const { data: shops = [] } = useShops();
  const router = useRouter();

  const groupedMap = groupedByShop();
  const groupedEntries = Array.from(groupedMap.entries());

  if (items.length === 0) {
    return (
      <div className="flex-1 bg-background flex flex-col">
        <div className="flex-1 container mx-auto px-4 py-20 md:pt-36 text-center">
          <div className="w-24 h-24 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="relative w-10 h-10">
              <img src="/icons/cart-new-black.svg" alt="" className="w-full h-full dark:hidden object-contain" loading="eager" decoding="sync" />
              <img src="/icons/cart-new-white.svg" alt="" className="hidden w-full h-full dark:block object-contain" loading="eager" decoding="sync" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Add items to start a cart</h1>
          <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
            Add a few things from the menu to see them here. Each shop prepares your order separately.
          </p>
          <Link
            href="/browse"
            className="inline-flex mt-8 pill bg-foreground text-background px-6 py-2.5 text-sm font-bold focus-dashed hover:bg-foreground/90 transition-smooth shadow-pop"
          >
            Start shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background flex flex-col">
      <div className="flex-1 container mx-auto px-4 pt-8 pb-24 md:pb-32 md:pt-28 grid lg:grid-cols-[1fr_380px] gap-12">
        {/* Left: cart items */}
        <div className="min-w-0">
          <div className="label-mono mb-2 text-primary">
            ● {groupedEntries.length > 1 ? "Multi-shop cart" : "Shop cart"}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Review Order</h1>
          <p className="text-muted-foreground mt-1 text-sm max-w-lg">
            Items are grouped by shop. Each shop requires its own payment and will issue a unique pickup code.
          </p>

          <div className="mt-10 space-y-10">
            {groupedEntries.map(([shopId, list]) => {
              const shop = shops.find(s => s.id === shopId);
              if (!shop) return null;
              
              const subTotal = list.reduce((n, c) => n + c.qty * c.item.price, 0);
              const commonSlot = list[0]?.scheduledSlot || "ASAP";

              return (
                <motion.div 
                  key={shopId} 
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-[2.5rem] border border-border bg-card overflow-hidden shadow-sm"
                >
                  {/* Shop header */}
                  <div className="px-6 py-5 bg-secondary/30 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-background grid place-items-center text-2xl shadow-inner">
                        {shop.emoji}
                      </div>
                      <div>
                        <div className="font-bold tracking-tight">{shop.name}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                          {list.length} {list.length === 1 ? 'item' : 'items'} • Prep: {shop.prepTime}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-lg">Rs {subTotal}</div>
                    </div>
                  </div>

                  {/* Scheduling per shop */}
                  <div className="px-6 py-4 bg-primary/[0.03] border-b border-border flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground shrink-0">
                      <Clock className="w-3.5 h-3.5 text-primary" /> Pickup Time:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {pickupSlots.map((s) => (
                        <button
                          key={s}
                          onClick={() => list.forEach(item => setScheduledSlot(item.item.id, s))}
                          className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${
                            commonSlot === s 
                              ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                              : "bg-background text-muted-foreground border-border hover:border-primary/50"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-border/50">
                    {list.map((c) => (
                      <div key={c.item.id} className="p-6 flex gap-6">
                        <div className="relative w-24 h-24 flex-shrink-0 group">
                          <Image
                            src={c.item.image}
                            alt={c.item.title}
                            fill
                            sizes="96px"
                            className="rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col">
                          <div className="flex items-start justify-between gap-3 mb-1">
                            <div className="min-w-0">
                              <div className="font-bold text-[16px] truncate">{c.item.title}</div>
                              <div className="text-xs text-muted-foreground font-mono">
                                Rs {c.item.price} per unit
                              </div>
                            </div>
                            <button
                              onClick={() => remove(c.item.id)}
                              className="text-muted-foreground hover:text-destructive p-2 hover:bg-destructive/5 rounded-full transition-all"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <input
                            value={c.notes ?? ""}
                            onChange={(e) => setNotes(c.item.id, e.target.value)}
                            placeholder="Add notes (extra spicy, no onions...)"
                            className="mt-2 w-full text-xs px-4 py-2.5 rounded-xl bg-secondary/50 placeholder:text-muted-foreground focus:ring-1 focus:ring-primary focus:bg-background outline-none transition-all"
                          />

                          <div className="mt-4 flex items-center justify-between gap-4 flex-wrap">
                            <div className="inline-flex rounded-full bg-secondary/80 p-1 text-[10px] font-bold uppercase tracking-wider border border-border">
                              {(["takeaway", "dine-in"] as const).map((type) => (
                                <button
                                  key={type}
                                  onClick={() => setDining(c.item.id, type)}
                                  className={`px-4 py-1.5 rounded-full transition-all ${
                                    c.dining === type 
                                      ? "bg-background text-foreground shadow-sm" 
                                      : "text-muted-foreground hover:text-foreground"
                                  }`}
                                >
                                  {type.replace("-", " ")}
                                </button>
                              ))}
                            </div>

                            <div className="inline-flex items-center rounded-full bg-background border border-border overflow-hidden shadow-sm">
                              <button
                                onClick={() => setQty(c.item.id, c.qty - 1)}
                                className="w-10 h-10 grid place-items-center hover:bg-secondary transition-colors"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="font-mono font-black w-8 text-center text-sm">
                                {c.qty}
                              </span>
                              <button
                                onClick={() => setQty(c.item.id, c.qty + 1)}
                                className="w-10 h-10 grid place-items-center hover:bg-secondary transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right: order summary */}
        <aside className="h-fit">
          <div className="sticky top-24 rounded-[2.5rem] border border-border bg-card p-8 shadow-xl">
            <div className="label-mono mb-4 text-primary">● Final Summary</div>
            <h2 className="text-2xl font-bold tracking-tight mb-6">
              Total Order
            </h2>

            <div className="space-y-4 mb-8">
              {groupedEntries.map(([id, list]) => {
                const shop = shops.find(s => s.id === id);
                const sub = list.reduce((n, c) => n + c.qty * c.item.price, 0);
                return (
                  <div key={id} className="flex justify-between items-center group">
                    <div className="flex items-center gap-2">
                      <span className="text-lg grayscale group-hover:grayscale-0 transition-all">{shop?.emoji}</span>
                      <span className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">{shop?.name}</span>
                    </div>
                    <span className="font-mono font-bold text-sm">Rs {sub}</span>
                  </div>
                );
              })}
            </div>

            <div className="p-4 rounded-2xl bg-secondary/50 flex items-start gap-3 mb-8 border border-border/50">
              <AlertCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                You will be redirected to process payments for each shop one after another. 
                Orders are only sent to vendors after payment confirmation.
              </p>
            </div>

            <div className="space-y-1 mb-8">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Grand Total</span>
                <span className="font-mono text-3xl font-black text-primary">Rs {total()}</span>
              </div>
            </div>

            <button
              onClick={() => router.push("/checkout")}
              className="w-full inline-flex items-center justify-center gap-3 h-16 rounded-2xl bg-foreground text-background font-bold hover:bg-foreground/90 transition-all shadow-pop active:scale-[0.98]"
            >
              Check out now <ArrowRight className="w-5 h-5" />
            </button>
            
            <p className="mt-4 text-[10px] text-muted-foreground text-center font-medium uppercase tracking-widest">
              Secured by The Edge checkout
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
