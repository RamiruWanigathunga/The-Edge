"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart, type CartEntry } from "@/store/cart";

export function CartItemRow({ entry }: { entry: CartEntry }) {
  const { setQty, remove, setNotes, setDining } = useCart();
  const c = entry;

  return (
    <div className="p-6 flex gap-6">
      <div className="relative w-24 h-24 flex-shrink-0 group">
        <Image
          src={c.item.image}
          alt={c.item.title}
          fill
          sizes="96px"
          className="rounded-2xl object-cover"
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
                    ? "bg-background text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {type.replace("-", " ")}
              </button>
            ))}
          </div>

          <div className="inline-flex items-center rounded-full bg-background border border-border overflow-hidden">
            <button
              onClick={() => setQty(c.item.id, c.qty - 1)}
              className="w-8 h-8 grid place-items-center hover:bg-secondary transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono font-black w-8 text-center text-sm">
              {c.qty}
            </span>
            <button
              onClick={() => setQty(c.item.id, c.qty + 1)}
              className="w-8 h-8 grid place-items-center hover:bg-secondary transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
