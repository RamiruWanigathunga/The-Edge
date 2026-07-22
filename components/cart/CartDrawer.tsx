"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { X, ArrowRight, AlertCircle } from "lucide-react";
import { useCart } from "@/store/cart";
import { useShops } from "@/lib/supabase/hooks";
import { CartShopSection } from "@/components/cart/CartShopSection";

export function CartDrawer() {
  const { items, total, groupedByShop, isDrawerOpen, closeDrawer } = useCart();
  const { data: shops = [] } = useShops();
  const router = useRouter();
  const pathname = usePathname();

  const groupedMap = groupedByShop();
  const groupedEntries = Array.from(groupedMap.entries());

  // Close on navigation, or if the cart empties out from under it.
  useEffect(() => {
    closeDrawer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (items.length === 0) closeDrawer();
  }, [items.length, closeDrawer]);

  const handleCheckout = () => {
    closeDrawer();
    router.push("/checkout");
  };

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <div className="hidden md:block">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="fixed inset-0 z-50 bg-black/45"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-background border-l border-border flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-border shrink-0">
              <h2 className="text-lg font-bold tracking-tight">Your cart</h2>
              <button
                onClick={closeDrawer}
                className="p-2 hover:bg-secondary rounded-full transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
              {groupedEntries.map(([shopId, list]) => {
                const shop = shops.find((s) => s.id === shopId);
                if (!shop) return null;
                return <CartShopSection key={shopId} shop={shop} items={list} />;
              })}
            </div>

            <div className="shrink-0 border-t border-border p-6 space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-secondary/50 border border-border/50">
                <AlertCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  You will be redirected to process payments for each shop one after another.
                </p>
              </div>

              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Grand Total</span>
                <span className="font-mono text-2xl font-black text-primary">Rs {total()}</span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full inline-flex items-center justify-center gap-3 h-12 text-sm rounded-2xl bg-foreground text-background font-bold hover:bg-foreground/90 transition-colors"
              >
                Go to checkout <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
