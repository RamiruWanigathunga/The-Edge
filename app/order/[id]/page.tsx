"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Check, ChefHat, Bell, ArrowRight, Receipt, RotateCcw, AlertTriangle } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { shopById } from "@/lib/mockData";
import { useLiveOrder } from "@/lib/supabase/hooks";
import { useCart } from "@/store/cart";
import { toast } from "sonner";

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
  const [order, setOrder] = useState<any>(null);
  const [expired, setExpired] = useState(false);
  const { add } = useCart();
  const { data: liveOrder } = useLiveOrder(code);

  useEffect(() => {
    if (liveOrder) return;

    const savedOrder = localStorage.getItem("edge-last-order");
    if (savedOrder) {
      setOrder(JSON.parse(savedOrder));
    }

    const t1 = setTimeout(() => setStage(1), 2500);
    const t2 = setTimeout(() => {
      setStage(2);
      // In-app notification when ready
      toast.success("🎉 Your order is ready for pickup!", {
        description: `Show code ${code} at the counter`,
        duration: 8000,
      });
    }, 6000);

    // Auto-expire after 30 min (mock: 90s for demo)
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
    setOrder({
      id: liveOrder.id,
      total: liveOrder.total,
      items: liveOrder.items.map((item) => ({
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
    });
  }, [liveOrder]);

  if (!order) {
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

  const grouped = new Map<string, any[]>();
  order.items.forEach((c: any) => {
    const arr = grouped.get(c.item.shopId) ?? [];
    arr.push(c);
    grouped.set(c.item.shopId, arr);
  });

  const handleReorder = () => {
    // TODO: Replace with Supabase query to fetch original order items
    order.items.forEach((c: any) => {
      add(c.item, c.qty, { notes: c.notes, dining: c.dining });
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

        {/* Pickup code hero card */}
        <div
          className={`rounded-[2rem] p-8 text-center transition-smooth shadow-pop ${
            stage === 2 && !expired
              ? "bg-success text-success-foreground"
              : expired
              ? "bg-muted text-muted-foreground"
              : "hero-gradient text-white"
          }`}
        >
          <div className="label-mono opacity-80 text-current mb-3">● Pickup code</div>
          <div className="font-mono font-bold text-7xl sm:text-8xl tracking-[0.15em] mt-3">
            {code}
          </div>
          <p className="mt-4 opacity-90 text-sm">
            {expired
              ? "This order has expired."
              : stage === 2
              ? "Show this code at the shop counter to collect your order."
              : "Save this code — you'll need it at pickup."}
          </p>
        </div>

        {/* Progress timeline */}
        <div className="mt-8 rounded-3xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold tracking-tight">Order status</h2>
            <span className="font-mono text-xs text-muted-foreground">#{order.id}</span>
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

        {/* Per-shop receipts */}
        <div className="mt-8 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Receipt className="w-4 h-4" />
            <h2 className="font-semibold tracking-tight">
              Pickup receipts ({grouped.size})
            </h2>
          </div>
          {Array.from(grouped.entries()).map(([shopId, list]) => {
            const shop = shopById(shopId);
            const sub = list.reduce((n: number, c: any) => n + c.qty * c.item.price, 0);
            return (
              <div key={shopId} className="rounded-3xl border border-border bg-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary grid place-items-center text-xl">
                      {shop?.emoji ?? "🍽️"}
                    </div>
                    <div>
                      <div className="font-semibold">{shop?.name ?? "Campus vendor"}</div>
                      <div className="text-xs text-muted-foreground font-mono">
                        Code: <span className="font-bold tracking-widest">{code}</span>
                      </div>
                    </div>
                  </div>
                  <span className="font-mono font-semibold">Rs {sub}</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {list.map((c: any) => (
                    <li key={c.item.id} className="flex justify-between">
                      <span>
                        {c.qty}× {c.item.title}{" "}
                        <span className="text-xs">({c.dining})</span>
                        {c.notes && (
                          <span className="text-xs italic"> · {c.notes}</span>
                        )}
                      </span>
                      <span className="font-mono">Rs {c.qty * c.item.price}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Master total */}
        <div className="mt-4 rounded-3xl border border-border bg-card p-5">
          <div className="flex justify-between items-center">
            <div>
              <div className="label-mono mb-1">Master receipt</div>
              <div className="text-sm text-muted-foreground">
                {order.items.length} item{order.items.length !== 1 ? "s" : ""} across {grouped.size} shop{grouped.size !== 1 ? "s" : ""}
              </div>
            </div>
            <div className="font-mono text-2xl font-bold">Rs {order.total}</div>
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
