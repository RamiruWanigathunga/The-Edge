"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ReceiptText, ArrowRight, Clock, CheckCircle2, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Footer } from "@/components/layout/Footer";
import { useCart } from "@/store/cart";
import { toast } from "sonner";
import { displayReferenceNumber } from "@/lib/mockData";
import { useUserOrders, useSupabaseUser } from "@/lib/supabase/hooks";

export default function OrdersPage() {
  const { data: user } = useSupabaseUser();
  const { data: orders = [], isLoading } = useUserOrders(user?.id);
  const [filter, setFilter] = useState<"all" | "today" | "week" | "month">("today");
  const [visibleCount, setVisibleCount] = useState(5);
  const { add } = useCart();

  const filteredOrders = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return (orders || []).filter((o) => {
      const placed = new Date(o.createdAt);
      if (filter === "today") return placed >= startOfToday;
      if (filter === "week") return placed >= startOfWeek;
      if (filter === "month") return placed >= startOfMonth;
      return true;
    });
  }, [orders, filter]);

  const visibleOrders = useMemo(() => filteredOrders.slice(0, visibleCount), [filteredOrders, visibleCount]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 200
      ) {
        if (visibleCount < filteredOrders.length) {
          setVisibleCount((prev) => prev + 5);
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [visibleCount, filteredOrders.length]);

  const handleReorder = (order: any) => {
    order.items.forEach((c: any) => {
      add({
        id: c.id,
        shopId: order.shopId,
        title: c.title,
        price: c.unitPrice,
        description: "",
        image: c.imageUrl || "/icons/icon-512.png",
        category: "",
        dietaryTags: [],
        estimatedPrepTime: "",
        isAvailable: true
      }, c.quantity, { notes: c.notes, dining: c.dining as "dine-in" | "takeaway" });
    });
    toast.success("Items added to cart!");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-8 md:pt-28 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Order History</h1>
          <p className="text-muted-foreground">Track your current and past campus orders.</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-4 mb-4">
          {(["all", "today", "week", "month"] as const).map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f);
                setVisibleCount(5);
              }}
              className={`pill px-4 py-2 text-sm font-medium transition-smooth capitalize ${
                filter === f
                  ? "bg-foreground text-background"
                  : "bg-secondary text-muted-foreground hover:bg-accent"
              }`}
            >
              {f === "all" ? "All Orders" : f}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="py-24 flex justify-center">
            <div className="animate-pulse flex items-center gap-2 text-muted-foreground font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-current" />
              <div className="w-1.5 h-1.5 rounded-full bg-current" />
              <div className="w-1.5 h-1.5 rounded-full bg-current" />
              Loading your orders...
            </div>
          </div>
        ) : visibleOrders.length > 0 ? (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {visibleOrders.map((order, idx) => {
                return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: Math.min(idx * 0.05, 0.3) }}
                  className="group rounded-3xl border border-border bg-card shadow-soft overflow-hidden"
                >
                  {/* Shop banner strip */}
                  <div className="relative h-16 w-full overflow-hidden">
                    {order.shopBanner ? (
                      <Image
                        src={order.shopBanner}
                        alt={order.shopName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full hero-gradient" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-between px-5">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{order.shopEmoji}</span>
                        <div className="text-white font-semibold text-sm">{order.shopName}</div>
                      </div>
                      <div
                        className={`pill text-[10px] font-bold px-2.5 py-1 flex items-center gap-1.5 ${
                          order.status === "completed"
                            ? "bg-white/20 text-white backdrop-blur-sm"
                            : "bg-white/20 text-white backdrop-blur-sm"
                        }`}
                      >
                        {order.status === "completed" ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        {(order.status?.toUpperCase() || "PAID")}
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    {/* Order info row */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-secondary grid place-items-center font-mono font-bold text-sm tracking-widest">
                          {order.code}
                        </div>
                        <div>
                          <div className="font-semibold">
                            {order.items[0]?.title ?? "Order"}
                            {order.items.length > 1 ? ` + ${order.items.length - 1} more` : ""}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })} · Rs {order.total}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Reference number */}
                    <div className="text-[11px] font-mono text-muted-foreground mb-3 pl-0.5">
                      Ref: {displayReferenceNumber(order.referenceNumber)}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <button
                        id={`reorder-${order.code}`}
                        onClick={() => handleReorder(order)}
                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-smooth focus-dashed"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Reorder
                      </button>
                      <Link
                        href={`/order/${encodeURIComponent(order.referenceNumber)}`}
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline focus-dashed"
                      >
                        View receipt <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )})}
            </AnimatePresence>

            {visibleCount < filteredOrders.length && (
              <div className="py-8 flex justify-center">
                <div className="animate-pulse flex items-center gap-2 text-muted-foreground text-xs font-medium">
                  <div className="w-1 h-1 rounded-full bg-current" />
                  <div className="w-1 h-1 rounded-full bg-current" />
                  <div className="w-1 h-1 rounded-full bg-current" />
                  Loading more orders...
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-24 rounded-[2rem] border border-dashed border-border bg-secondary/20">
            <div className="w-16 h-16 rounded-full bg-secondary grid place-items-center mx-auto mb-4">
              <ReceiptText className="w-6 h-6 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No orders found</h2>
            <p className="text-muted-foreground mb-8">
              {filter === "all" 
                ? "Your order history will appear here once you place an order."
                : `You don't have any orders for ${filter}.`}
            </p>
            {filter === "all" ? (
              <Link
                href="/"
                className="pill bg-foreground text-background px-8 py-3 font-medium hover:bg-foreground/90 transition-smooth"
              >
                Start Ordering
              </Link>
            ) : (
              <button
                onClick={() => setFilter("all")}
                className="pill border border-border px-8 py-3 font-medium hover:bg-secondary transition-smooth"
              >
                Show all orders
              </button>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
