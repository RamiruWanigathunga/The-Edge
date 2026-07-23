"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, CheckCircle2, RotateCcw, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/store/cart";
import { toast } from "sonner";
import { displayReferenceNumber } from "@/lib/types";
import { useUserOrders, useSupabaseUser } from "@/lib/supabase/hooks";
import { BillIcon } from "@/components/ui/NavIcons";
import { startOfDay } from "@/lib/utils";

type TimeFilter = "all" | "today" | "week" | "month";

const timeFilters: { id: TimeFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "today", label: "Today" },
  { id: "week", label: "This week" },
  { id: "month", label: "This month" },
];

function startOfWeek(date: Date) {
  const start = startOfDay(date);
  const day = start.getDay();
  const diffToMonday = day === 0 ? 6 : day - 1;
  start.setDate(start.getDate() - diffToMonday);
  return start;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export default function OrdersPage() {
  const { data: user } = useSupabaseUser();
  const { data: orders = [], isLoading } = useUserOrders(user?.id);
  const [visibleCount, setVisibleCount] = useState(5);
  const [clearedOrderIds, setClearedOrderIds] = useState<Set<string>>(new Set());
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("today");
  const { add } = useCart();

  useEffect(() => {
    if (!user?.id) {
      setClearedOrderIds(new Set());
      return;
    }

    const saved = localStorage.getItem(`edge-cleared-orders-${user.id}`);
    setClearedOrderIds(new Set(saved ? JSON.parse(saved) : []));
  }, [user?.id]);

  const persistClearedOrderIds = (ids: Set<string>) => {
    setClearedOrderIds(ids);
    if (user?.id) {
      localStorage.setItem(`edge-cleared-orders-${user.id}`, JSON.stringify([...ids]));
    }
  };

  const unclearedOrders = useMemo(
    () => (orders || []).filter((o) => !clearedOrderIds.has(o.id)),
    [orders, clearedOrderIds]
  );

  const filteredOrders = useMemo(() => {
    if (timeFilter === "all") return unclearedOrders;

    const now = new Date();
    const todayStart = startOfDay(now);
    const weekStart = startOfWeek(now);
    const monthStart = startOfMonth(now);

    return unclearedOrders.filter((o) => {
      const orderDate = new Date(o.createdAt);
      if (timeFilter === "today") return orderDate >= todayStart;
      if (timeFilter === "week") return orderDate >= weekStart;
      return orderDate >= monthStart;
    });
  }, [unclearedOrders, timeFilter]);

  useEffect(() => {
    setVisibleCount(5);
  }, [timeFilter]);

  const visibleOrders = useMemo(() => filteredOrders.slice(0, visibleCount), [filteredOrders, visibleCount]);
  const totalSpend = useMemo(
    () => filteredOrders.reduce((sum, order) => sum + order.total, 0),
    [filteredOrders]
  );
  const hasAnyOrders = unclearedOrders.length > 0;
  const isEmpty = !isLoading && !hasAnyOrders;

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

  const handleClearHistory = () => {
    persistClearedOrderIds(new Set([...clearedOrderIds, ...filteredOrders.map((o) => o.id)]));
  };

  const handleClearOne = (orderId: string) => {
    persistClearedOrderIds(new Set([...clearedOrderIds, orderId]));
  };

  return (
    <div className="flex-1 bg-background flex flex-col">
      <main
        className={`flex-1 container mx-auto px-4 max-w-3xl ${
          isEmpty ? "flex flex-col items-center justify-center pb-16 md:pb-24" : "pt-8 pb-24 md:pb-32 md:pt-28"
        }`}
      >
        {(hasAnyOrders || isLoading) && (
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Order History</h1>
            <p className="text-muted-foreground">Track your current and past orders.</p>
          </div>
        )}

        {hasAnyOrders && (
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {timeFilters.map((f) => (
                <button
                  key={f.id}
                  id={`orders-filter-${f.id}`}
                  onClick={() => setTimeFilter(f.id)}
                  className={`pill px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-smooth focus-dashed ${
                    timeFilter === f.id
                      ? "bg-foreground text-background"
                      : "bg-secondary text-foreground hover:bg-accent"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            {filteredOrders.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="pill shadow-soft px-3 py-1.5 text-xs font-bold focus-dashed hover:bg-secondary transition-colors shrink-0"
              >
                Clear history
              </button>
            )}
          </div>
        )}

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
                  className="group rounded-3xl shadow-soft bg-card overflow-hidden"
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
                    <div className="absolute inset-0 bg-black/45" />
                    <div className="absolute inset-0 flex items-center justify-between px-5">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{order.shopEmoji}</span>
                        <div className="text-white font-semibold text-sm">{order.shopName}</div>
                      </div>
                      <div
                        className={`pill text-[10px] font-bold px-2.5 py-1 flex items-center gap-1.5 ${
                          order.status === "completed"
                            ? "bg-white/20 text-white"
                            : "bg-white/20 text-white"
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
                      <button
                        onClick={() => handleClearOne(order.id)}
                        aria-label="Clear order"
                        className="w-8 h-8 rounded-full grid place-items-center focus-dashed transition-smooth hover:bg-secondary text-muted-foreground shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
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

            <section className="mt-6 rounded-3xl shadow-soft bg-card p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-bold tracking-tight">Total spend</h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    {timeFilters.find((f) => f.id === timeFilter)?.label}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black tracking-tight">Rs {totalSpend}</div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                    {filteredOrders.length} {filteredOrders.length === 1 ? "order" : "orders"}
                  </div>
                </div>
              </div>
            </section>
          </div>
        ) : hasAnyOrders ? (
          <div className="text-center py-16">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <BillIcon className="w-full h-full text-foreground" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">No orders {timeFilter === "all" ? "found" : `${timeFilters.find((f) => f.id === timeFilter)?.label.toLowerCase()}`}</h2>
            <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
              Try a different time range to see more of your order history.
            </p>
          </div>
        ) : (
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <BillIcon className="w-full h-full text-foreground" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">No orders yet</h2>
            <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
              Your order history will appear here once you place an order.
            </p>
            <Link
              href="/browse"
              className="inline-flex mt-8 pill bg-foreground text-background px-6 py-2.5 text-sm font-bold focus-dashed hover:bg-foreground/90 transition-colors"
            >
              Start an order
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
