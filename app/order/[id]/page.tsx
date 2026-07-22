"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Check, ChefHat, Bell, ArrowRight, ArrowLeft, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { ReceiptCard } from "@/components/ui/ReceiptCard";
import { useLiveOrder, useUserOrders, useSupabaseUser } from "@/lib/supabase/hooks";

type Stage = 0 | 1 | 2;

const stages = [
  { label: "Order received", sub: "We've got your order!", icon: Check, color: "warning" },
  { label: "In preparation", sub: "The shop is preparing your food.", icon: ChefHat, color: "primary" },
  { label: "Ready for pickup", sub: "Show your code at the counter.", icon: Bell, color: "success" },
] as const;

export default function OrderStatusPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = decodeURIComponent(params?.id as string);
  const { data: user } = useSupabaseUser();
  const [stage, setStage] = useState<Stage>(0);
  const [order, setOrder] = useState<any | null>(null);
  const { data: allOrders = [] } = useUserOrders(user?.id);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expired, setExpired] = useState(false);
  const { data: liveOrder, isLoading: isLiveLoading } = useLiveOrder(rawId);

  // Swipe tracking
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Find the current order in the list
  useEffect(() => {
    if (!allOrders.length) return;
    const idx = allOrders.findIndex((o) => o.referenceNumber === rawId);
    if (idx >= 0) {
      setCurrentIndex(idx);
    }
  }, [rawId, allOrders]);

  // Navigate to adjacent order
  const navigateTo = useCallback((index: number) => {
    if (index >= 0 && index < allOrders.length) {
      const target = allOrders[index];
      router.push(`/order/${encodeURIComponent(target.referenceNumber)}`);
    }
  }, [allOrders, router]);

  // Swipe handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 60;
    if (Math.abs(diff) > threshold) {
      if (diff > 0 && currentIndex < allOrders.length - 1) {
        // Swipe left → next (older) order
        navigateTo(currentIndex + 1);
      } else if (diff < 0 && currentIndex > 0) {
        // Swipe right → previous (newer) order
        navigateTo(currentIndex - 1);
      }
    }
  }, [currentIndex, allOrders.length, navigateTo]);

  // Keyboard arrow navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && currentIndex > 0) {
        navigateTo(currentIndex - 1);
      } else if (e.key === "ArrowRight" && currentIndex < allOrders.length - 1) {
        navigateTo(currentIndex + 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, allOrders.length, navigateTo]);

  useEffect(() => {
    if (!liveOrder) return;

    const statusStage: Record<string, Stage> = {
      paid: 0,
      preparing: 1,
      ready: 2,
      completed: 2,
      expired: 2,
      customer_late: 2,
    };

    setStage(statusStage[liveOrder.status] ?? 0);
    setExpired(liveOrder.status === "expired" || liveOrder.status === "customer_late");

    const livePerShop = {
      id: liveOrder.id,
      orderCode: liveOrder.code,
      referenceNumber: liveOrder.referenceNumber,
      shopId: liveOrder.shopId || "",
      shopName: liveOrder.shopName || "Campus vendor",
      shopEmoji: liveOrder.shopEmoji || "🍽️",
      shopBanner: liveOrder.shopBanner,
      customerName: (liveOrder.customerName && liveOrder.customerName !== "Guest") 
        ? liveOrder.customerName 
        : (user?.user_metadata?.full_name || user?.user_metadata?.name || (user?.email ? user.email.split('@')[0] : "Customer")),
      items: liveOrder.items.map((item: any) => ({
        id: item.id,
        title: item.title,
        price: item.unitPrice,
        image: item.imageUrl || "/icons/icon-512.png",
        qty: item.quantity,
        notes: item.notes,
        dining: item.dining,
      })),
      total: liveOrder.total,
      orderTime: liveOrder.pickupTime || "",
      status: liveOrder.status,
      placedAt: liveOrder.createdAt,
      slot: liveOrder.scheduledSlot,
    };
    setOrder(livePerShop);
  }, [liveOrder]);

  if (isLiveLoading) {
    return (
      <div className="flex-1 bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading order details...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-20 md:pt-36 text-center">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-muted-foreground">No active order found.</p>
          <Link href="/" className="text-primary mt-4 inline-block hover:underline">
            ← Back home
          </Link>
        </div>
      </div>
    );
  }

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allOrders.length - 1;

  return (
    <div className="flex-1 bg-background">
      <div
        ref={containerRef}
        className="container mx-auto px-4 py-8 md:pt-28 max-w-2xl"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >

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

        {/* Swipe navigation indicator */}
        {allOrders.length > 1 && (
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => hasPrev && navigateTo(currentIndex - 1)}
              disabled={!hasPrev}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-smooth focus-dashed disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" /> Newer
            </button>
            <span className="text-xs text-muted-foreground font-mono">
              {currentIndex + 1} / {allOrders.length}
            </span>
            <button
              onClick={() => hasNext && navigateTo(currentIndex + 1)}
              disabled={!hasNext}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-smooth focus-dashed disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Older <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Receipt */}
        <div className="mb-8">
          <ReceiptCard order={order} />
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
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 pill bg-foreground text-background px-6 py-2.5 font-bold hover:bg-foreground/90 transition-smooth focus-dashed text-sm"
          >
            Order more <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
