"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Check, ChefHat, Bell, ArrowRight, RotateCcw, AlertTriangle } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { ReceiptCard } from "@/components/ui/ReceiptCard";
import { useLiveOrder } from "@/lib/supabase/hooks";
import { useCart } from "@/store/cart";
import { toast } from "sonner";
import type { PerShopOrder } from "@/lib/mockData";

type Stage = 0 | 1 | 2;

const stages = [
  { label: "Order received", sub: "We've got your order!", icon: Check, color: "warning" },
  { label: "In preparation", sub: "The shop is preparing your food.", icon: ChefHat, color: "primary" },
  { label: "Ready for pickup", sub: "Show your code at the counter.", icon: Bell, color: "success" },
] as const;

export default function OrderStatusPage() {
  const params = useParams();
  const code = params?.id as string;
  const [stage, setStage] = useState<Stage>(0);
  const [orders, setOrders] = useState<PerShopOrder[]>([]);
  const [expired, setExpired] = useState(false);
  const { add } = useCart();
  const { data: liveOrder } = useLiveOrder(code);

  useEffect(() => {
    if (liveOrder) return;

    // Load from localStorage — try last-orders first (multi-shop checkout)
    const lastOrders = localStorage.getItem("edge-last-orders");
    if (lastOrders) {
      try {
        const parsed: PerShopOrder[] = JSON.parse(lastOrders);
        // Filter orders matching this code, or show all if navigating from checkout
        const matching = parsed.filter((o) => o.orderCode === code);
        if (matching.length > 0) {
          setOrders(matching);
        } else {
          // If code doesn't match, show all from last checkout
          setOrders(parsed);
        }
      } catch {}
    }

    // Fallback: search in all orders
    if (!lastOrders) {
      const allOrders = localStorage.getItem("edge-orders");
      if (allOrders) {
        try {
          const parsed: PerShopOrder[] = JSON.parse(allOrders);
          const matching = parsed.filter((o) => o.orderCode === code);
          if (matching.length > 0) {
            setOrders(matching);
          }
        } catch {}
      }
    }

    const t1 = setTimeout(() => setStage(1), 2500);
    const t2 = setTimeout(() => {
      setStage(2);
      toast.success("🎉 Your order is ready for pickup!", {
        description: `Show code ${code} at the counter`,
        duration: 8000,
      });
    }, 6000);

    const t3 = setTimeout(() => {
      setExpired(true);
      toast.error("Order expired", {
        description: "This order has been cancelled. Please place a new order.",
      });
    }, 90000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [code, liveOrder]);

  useEffect(() => {
    if (!liveOrder) return;

    const statusStage: Record<string, Stage> = {
      new: 0,
      preparing: 1,
      ready: 2,
      completed: 2,
      expired: 2,
      customer_late: 2,
    };

    setStage(statusStage[liveOrder.status] ?? 0);
    setExpired(liveOrder.status === "expired" || liveOrder.status === "customer_late");

    const livePerShop: PerShopOrder = {
      id: liveOrder.id,
      orderCode: code,
      referenceNumber: "",
      shopId: liveOrder.items[0]?.shopId || "",
      shopName: "Campus vendor",
      shopEmoji: "🍽️",
      customerName: "Guest",
      items: liveOrder.items.map((item: any) => ({
        item: {
          id: item.id,
          shopId: item.shopId,
          title: item.title,
          description: "",
          image: "/icons/icon-512.png",
          price: item.unitPrice,
          category: "",
          dietaryTags: [],
          estimatedPrepTime: "",
          isAvailable: true,
        },
        qty: item.quantity,
        notes: item.notes,
        dining: item.dining,
      })),
      total: liveOrder.total,
      orderTime: "",
      status: liveOrder.status,
      placedAt: new Date().toISOString(),
      slot: "ASAP",
    };
    setOrders([livePerShop]);
  }, [liveOrder, code]);

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-20 md:pt-36 text-center">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-muted-foreground">No active order found.</p>
          <Link href="/" className="text-primary mt-4 inline-block hover:underline">
            ← Back home
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const handleReorder = () => {
    // TODO: Replace with Supabase query to fetch original order items
    orders.forEach((order) => {
      order.items.forEach((c) => {
        add(c.item, c.qty, { notes: c.notes, dining: c.dining as "dine-in" | "takeaway" });
      });
    });
    toast.success("Items added to cart!");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:pt-28 max-w-2xl">

        {/* Expired warning */}
        {expired && (
          <div className="mb-6 rounded-2xl bg-destructive/10 border border-destructive/20 px-5 py-4 flex items-center gap-3 text-destructive">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div>
              <div className="font-semibold">Order expired</div>
              <div className="text-sm opacity-80">This order can no longer be collected.</div>
            </div>
          </div>
        )}

        {/* Per-shop receipts — shown at the top */}
        <div className="space-y-4 mb-8">
          {orders.map((order) => (
            <ReceiptCard key={order.id} order={order} />
          ))}
        </div>

        {/* Progress timeline */}
        <div className="rounded-3xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold tracking-tight">Order status</h2>
          </div>
          <div className="relative">
            <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-border" />
            <div
              className="absolute left-5 top-5 w-0.5 bg-success transition-all duration-700"
              style={{ height: `${stage * 50}%` }}
            />
            <div className="space-y-6">
              {stages.map((s, idx) => {
                const reached = stage >= idx;
                const Icon = s.icon;
                return (
                  <div key={s.label} className="relative flex items-center gap-4">
                    <div
                      className={`relative z-10 w-10 h-10 rounded-full grid place-items-center transition-smooth ${
                        reached
                          ? idx === 2
                            ? "bg-success text-success-foreground"
                            : "bg-foreground text-background"
                          : "bg-secondary text-muted-foreground"
                      } ${stage === idx && idx !== 2 ? "animate-pulse-soft" : ""}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className={`font-semibold ${reached ? "text-foreground" : "text-muted-foreground"}`}>
                        {s.label}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {stage === idx ? "In progress…" : reached ? s.sub : "Waiting…"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            id="reorder-btn"
            onClick={handleReorder}
            className="inline-flex items-center gap-2 pill border border-border px-5 py-3 font-medium hover:bg-secondary transition-smooth focus-dashed text-sm"
          >
            <RotateCcw className="w-4 h-4" /> Reorder
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 pill bg-foreground text-background px-5 py-3 font-medium hover:bg-foreground/90 transition-smooth focus-dashed text-sm"
          >
            Order more <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
