"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Plus } from "lucide-react";
import { MenuItem } from "@/lib/types";

type DiningType = "dine-in" | "takeaway";

const diningLabel: Record<DiningType, string> = {
  takeaway: "Takeaway",
  "dine-in": "Dine-in",
};

export function AddToCartModal({
  item,
  shopName,
  open,
  onClose,
  onConfirm,
}: {
  item: MenuItem;
  shopName?: string;
  open: boolean;
  onClose: () => void;
  onConfirm: (qty: number, opts: { notes?: string; dining: DiningType }) => void;
}) {
  const [qty, setQty] = React.useState(1);
  const [notes, setNotes] = React.useState("");
  const [dining, setDining] = React.useState<DiningType>("takeaway");

  React.useEffect(() => {
    if (open) {
      setQty(1);
      setNotes("");
      setDining("takeaway");
    }
  }, [open]);

  const maxQty = item.maxPerOrder ?? Infinity;

  const isSpecialTag = (tag: string) => {
    const normalized = tag.toLowerCase();
    return normalized === "vegan" || normalized === "vegetarian";
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60"
          />
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className="fixed inset-x-0 bottom-0 sm:inset-0 sm:m-auto z-50 w-full sm:max-w-3xl sm:h-fit sm:max-h-[85vh] max-h-[65vh] bg-card rounded-t-[2rem] sm:rounded-[2rem] border border-border overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-end sm:justify-start px-5 pt-5 sm:px-8 sm:pt-8 shrink-0">
              <button
                onClick={onClose}
                aria-label="Close"
                className="w-9 h-9 rounded-full grid place-items-center bg-secondary/80 sm:bg-transparent hover:bg-secondary transition-colors focus-dashed"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6 sm:px-8 sm:pb-8">
              <div className="sm:grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] sm:gap-12">
                <div className="hidden sm:block relative sm:w-full aspect-square rounded-2xl overflow-hidden bg-muted">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 80px, 336px"
                    className="object-cover"
                  />
                </div>

                <div className="space-y-6">
                  <div className="text-center sm:text-left">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{item.title}</h2>
                    {shopName && (
                      <p className="text-sm text-muted-foreground mt-0.5">{shopName}</p>
                    )}
                    <div className="mt-1.5 font-mono font-bold text-lg text-muted-foreground">
                      Rs {item.price.toFixed(0)}
                    </div>
                    {item.dietaryTags.length > 0 && (
                      <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 mt-2.5">
                        {item.dietaryTags.map((tag) => (
                          <span
                            key={tag}
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
                              isSpecialTag(tag)
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300"
                                : "bg-secondary text-muted-foreground"
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-border pt-5">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-base font-bold">Dining</h3>
                      <span className="pill bg-secondary text-muted-foreground text-[10px] font-bold uppercase tracking-wider px-3 py-1">
                        Required
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">Choose 1</p>

                    <div>
                      {(["takeaway", "dine-in"] as const).map((type, idx) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setDining(type)}
                          className={`w-full flex items-center justify-between py-3.5 text-left ${
                            idx === 0 ? "border-b border-border/60" : ""
                          }`}
                        >
                          <span className="text-sm font-medium">{diningLabel[type]}</span>
                          <span
                            className={`w-5 h-5 rounded-full border-2 grid place-items-center transition-colors ${
                              dining === type ? "border-foreground" : "border-border"
                            }`}
                          >
                            {dining === type && <span className="w-2.5 h-2.5 rounded-full bg-foreground" />}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-border pt-5">
                    <h3 className="text-base font-bold mb-3">Special instructions</h3>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add a note (extra spicy, no onions...)"
                      rows={3}
                      className="w-full text-sm px-4 py-3 rounded-2xl bg-secondary/50 placeholder:text-muted-foreground focus:ring-1 focus:ring-primary focus:bg-background outline-none transition-all resize-none"
                    />
                  </div>

                  <div className="border-t border-border pt-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold">Quantity</h3>
                      <div className="inline-flex items-center rounded-full bg-secondary border border-border overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setQty((q) => Math.max(1, q - 1))}
                          disabled={qty <= 1}
                          className="w-9 h-9 grid place-items-center hover:bg-background transition-colors disabled:opacity-40"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-mono font-black w-8 text-center text-sm">{qty}</span>
                        <button
                          type="button"
                          onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                          disabled={qty >= maxQty}
                          className="w-9 h-9 grid place-items-center hover:bg-background transition-colors disabled:opacity-40"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {item.maxPerOrder && (
                      <p className="text-[11px] text-muted-foreground mt-2">Max {item.maxPerOrder} per order</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div
              className="shrink-0 border-t border-border p-4"
              style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)" }}
            >
              <button
                onClick={() => onConfirm(qty, { notes: notes.trim() || undefined, dining })}
                className="w-full h-14 rounded-2xl bg-foreground text-background font-bold text-sm hover:bg-foreground/90 transition-colors"
              >
                Add {qty} to order · Rs {(item.price * qty).toFixed(0)}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
