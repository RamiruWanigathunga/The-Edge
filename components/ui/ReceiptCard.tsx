"use client";

import Image from "next/image";
import type { PerShopOrder } from "@/lib/mockData";

export function ReceiptCard({ order }: { order: PerShopOrder }) {
  const formattedDate = new Date(order.placedAt).toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="relative rounded-2xl overflow-hidden bg-card border border-border shadow-soft text-base">
      {/* Shop banner header */}
      <div className="relative h-28 sm:h-32 w-full overflow-hidden">
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-3xl">{order.shopEmoji}</span>
            <div>
              <div className="text-white font-bold text-base leading-tight">{order.shopName}</div>
              <div className="text-white/70 text-xs font-mono">{formattedDate}</div>
            </div>
          </div>
          <div className="text-white/90 font-mono text-sm font-semibold leading-tight text-right">
            {order.orderTime}
          </div>
        </div>
      </div>

      {/* Receipt body */}
      <div className="px-5 sm:px-6 py-5">
        {/* Zigzag edge visual separator */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 border-t border-dashed border-border" />
          <span className="text-xs font-mono text-muted-foreground tracking-widest uppercase">Order Receipt</span>
          <div className="flex-1 border-t border-dashed border-border" />
        </div>

        {/* Order code + reference */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-1">Order Code</div>
            <div className="font-mono font-black text-4xl sm:text-5xl tracking-[0.18em]">{order.orderCode}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-1">Customer</div>
            <div className="text-base font-bold">{order.customerName}</div>
          </div>
        </div>

        {/* Reference number */}
        <div className="rounded-xl bg-secondary/80 px-3 py-2 mb-4">
          <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-1">Ref No.</div>
          <div className="font-mono text-sm font-bold tracking-wide">{order.referenceNumber}</div>
        </div>

        {/* Dashed divider */}
        <div className="border-t border-dashed border-border mb-3" />

        {/* Items header */}
        <div className="flex justify-between text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2 px-0.5">
          <span>Item</span>
          <span>Amount</span>
        </div>

        {/* Items list */}
        <div className="space-y-2.5 mb-3">
          {order.items.map((c, idx) => (
            <div key={idx} className="flex justify-between items-start text-base">
              <div className="flex-1 min-w-0 pr-3">
                <span className="font-semibold">{c.qty}<span className="text-muted-foreground mx-1 text-sm">×</span>{c.item.title}</span>
                {c.notes && (
                  <div className="text-xs text-muted-foreground italic mt-0.5">Note: {c.notes}</div>
                )}
              </div>
              <span className="font-mono text-base font-semibold shrink-0">Rs {c.qty * c.item.price}</span>
            </div>
          ))}
        </div>

        {/* Dashed divider */}
        <div className="border-t border-dashed border-border my-3" />

        {/* Total */}
        <div className="flex justify-between items-center">
          <span className="font-mono text-sm text-muted-foreground uppercase tracking-wider">Total</span>
          <span className="font-mono text-2xl font-black">Rs {order.total}</span>
        </div>

        {/* Pickup slot */}
        {order.slot && (
          <div className="mt-3 flex items-center gap-2">
            <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Pickup</div>
            <div className="pill bg-secondary text-sm font-mono font-semibold px-3 py-1">{order.slot}</div>
          </div>
        )}

        {/* Bottom dashed divider */}
        <div className="border-t border-dashed border-border mt-4 mb-3" />

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground font-mono">
            Show your order code at the counter
          </p>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            Thank you for your order!
          </p>
        </div>
      </div>
    </div>
  );
}
