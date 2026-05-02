"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ReceiptText, ArrowRight, Clock, CheckCircle2, RotateCcw } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { useCart } from "@/store/cart";
import { toast } from "sonner";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const { add } = useCart();

  useEffect(() => {
    // TODO: Replace with Supabase query — SELECT * FROM orders WHERE user_id = auth.uid() ORDER BY created_at DESC
    const saved = localStorage.getItem("edge-orders");
    if (saved) {
      try {
        setOrders(JSON.parse(saved).reverse());
      } catch {}
    }
  }, []);

  const handleReorder = (order: any) => {
    order.items.forEach((c: any) => {
      add(c.item, c.qty, { notes: c.notes, dining: c.dining });
    });
    toast.success("Items added to cart!");
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 md:pt-28 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Order History</h1>
          <p className="text-muted-foreground">Track your current and past campus orders.</p>
        </div>

        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order: any) => (
              <div
                key={order.code}
                className="group p-5 rounded-3xl border border-border bg-card shadow-soft"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-secondary grid place-items-center font-mono font-bold text-sm tracking-widest">
                      {order.code}
                    </div>
                    <div>
                      <div className="font-semibold">
                        {order.items[0]?.item?.title ?? "Order"}
                        {order.items.length > 1 ? ` + ${order.items.length - 1} more` : ""}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(order.placedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })} · Rs {order.total}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`pill text-[10px] font-bold px-2.5 py-1 flex items-center gap-1.5 ${
                      order.status === "completed"
                        ? "bg-success-soft text-success-foreground"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {order.status === "completed" ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <Clock className="w-3 h-3" />
                    )}
                    {(order.status?.toUpperCase() || "PREPARING")}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    id={`reorder-${order.code}`}
                    onClick={() => handleReorder(order)}
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-smooth focus-dashed"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reorder
                  </button>
                  <Link
                    href={`/order/${order.code}`}
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline focus-dashed"
                  >
                    View details <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 rounded-[2rem] border border-dashed border-border bg-secondary/20">
            <div className="w-16 h-16 rounded-full bg-secondary grid place-items-center mx-auto mb-4">
              <ReceiptText className="w-6 h-6 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-8">
              Your order history will appear here once you place an order.
            </p>
            <Link
              href="/"
              className="pill bg-foreground text-background px-8 py-3 font-medium hover:bg-foreground/90 transition-smooth"
            >
              Start Ordering
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
