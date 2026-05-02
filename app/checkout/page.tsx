"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Clock, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { useCart } from "@/store/cart";
import { shopById } from "@/lib/mockData";

const pickupSlots = ["ASAP", "+15 min", "+30 min", "+1 hr", "+2 hr", "Scheduled"];

export default function CheckoutPage() {
  const { total, items, clear, groupedByShop } = useCart();
  const [slot, setSlot] = useState("ASAP");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const grouped = Array.from(groupedByShop().entries());

  const handlePay = () => {
    if (items.length === 0) return;
    setLoading(true);

    // TODO: Replace with real payment gateway integration (per-shop payment links)
    // TODO: Replace with Supabase order creation — INSERT INTO orders
    setTimeout(() => {
      const code = Array.from(
        { length: 4 },
        () => "ABCDEFGHJKMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 31)]
      ).join("");
      const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;

      const order = {
        id: orderId,
        code,
        items: useCart.getState().items,
        total: useCart.getState().total(),
        slot,
        note,
        placedAt: Date.now(),
        status: "new",
      };

      // TODO: Store in Supabase — for now use localStorage
      try {
        const existing = JSON.parse(localStorage.getItem("edge-orders") || "[]");
        localStorage.setItem("edge-orders", JSON.stringify([...existing, order]));
        localStorage.setItem("edge-last-order", JSON.stringify(order));
      } catch {}

      clear();
      toast.success("Payment confirmed! Your order is being prepared.");
      router.push(`/order/${code}`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:pt-28 max-w-2xl">
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground focus-dashed transition-smooth mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to cart
        </Link>

        <div className="label-mono mb-2">● Checkout</div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Almost there</h1>

        <div className="mt-8 space-y-6">
          {/* Order summary */}
          <section className="rounded-3xl border border-border bg-card p-6">
            <h2 className="font-semibold tracking-tight mb-4">Order summary</h2>
            <div className="space-y-3">
              {grouped.map(([shopId, list]) => {
                const shop = shopById(shopId)!;
                const sub = list.reduce((n, c) => n + c.qty * c.item.price, 0);
                return (
                  <div key={shopId}>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <div className="flex items-center gap-2 font-medium">
                        <span>{shop.emoji}</span> {shop.name}
                      </div>
                      <span className="font-mono">Rs {sub}</span>
                    </div>
                    {list.map((c) => (
                      <div key={c.item.id} className="flex justify-between text-xs text-muted-foreground pl-6">
                        <span>{c.qty}× {c.item.title} {c.notes ? `(${c.notes})` : ""}</span>
                        <span className="font-mono">Rs {c.qty * c.item.price}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Pickup time */}
          <section className="rounded-3xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-primary" />
              <h2 className="font-semibold tracking-tight">Pickup time</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {pickupSlots.map((s) => (
                <button
                  key={s}
                  id={`slot-${s.replace(/\s+/g, "-").toLowerCase()}`}
                  onClick={() => setSlot(s)}
                  className={`pill px-4 py-2 text-sm font-medium transition-smooth focus-dashed ${
                    slot === s
                      ? "bg-foreground text-background"
                      : "bg-secondary hover:bg-accent"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Smart default: ASAP. Pick a later time if you want it ready when you swing by.
            </p>
          </section>

          {/* Order note */}
          <section className="rounded-3xl border border-border bg-card p-6">
            <h2 className="font-semibold tracking-tight mb-3">Order note (optional)</h2>
            <textarea
              id="order-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Anything the shops should know across the whole order…"
              rows={3}
              className="w-full text-sm px-4 py-3 rounded-2xl bg-secondary placeholder:text-muted-foreground focus-dashed focus:bg-background border border-transparent focus:border-border resize-none outline-none transition-smooth"
            />
          </section>

          {/* Total + pay */}
          <section className="rounded-3xl bg-foreground text-background p-6 shadow-pop">
            <div className="flex items-center justify-between mb-5">
              <span className="text-sm text-background/70">Total</span>
              <span className="font-mono text-3xl font-bold">Rs {total()}</span>
            </div>
            <button
              id="pay-btn"
              onClick={handlePay}
              disabled={loading || items.length === 0}
              className="w-full inline-flex items-center justify-center gap-2 pill bg-background text-foreground px-6 py-4 font-semibold hover:bg-background/90 transition-smooth focus-dashed disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                  Processing payment…
                </span>
              ) : (
                <>
                  <Lock className="w-4 h-4" /> Pay securely
                </>
              )}
            </button>
            <p className="mt-3 text-[11px] text-background/60 text-center">
              {/* TODO: Replace with actual payment gateway links from vendor settings */}
              Demo payment — connect your payment provider in vendor settings.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
