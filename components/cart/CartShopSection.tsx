"use client";

import { Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useCart, type CartEntry } from "@/store/cart";
import type { Shop } from "@/lib/types";
import { CartItemRow } from "@/components/cart/CartItemRow";

const pickupSlots = ["ASAP", "+15 min", "+30 min", "+1 hr", "+2 hr"];

export function CartShopSection({ shop, items }: { shop: Shop; items: CartEntry[] }) {
  const { setScheduledSlot } = useCart();
  const subTotal = items.reduce((n, c) => n + c.qty * c.item.price, 0);
  const commonSlot = items[0]?.scheduledSlot || "ASAP";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[2.5rem] border border-border bg-card overflow-hidden"
    >
      {/* Shop header */}
      <div className="px-6 py-5 bg-secondary/30 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-background grid place-items-center text-2xl border border-border">
            {shop.emoji}
          </div>
          <div>
            <div className="font-bold tracking-tight">{shop.name}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold flex items-center gap-2">
              <span>{items.length} {items.length === 1 ? "item" : "items"}</span>
              <span>Prep: {shop.prepTime}</span>
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
              onClick={() => items.forEach((item) => setScheduledSlot(item.item.id, s))}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${
                commonSlot === s
                  ? "bg-primary text-primary-foreground border-primary"
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
        {items.map((c) => (
          <CartItemRow key={c.item.id} entry={c} />
        ))}
      </div>
    </motion.div>
  );
}
