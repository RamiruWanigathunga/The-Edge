"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, AlertCircle, ReceiptText } from "lucide-react";
import { useCart } from "@/store/cart";
import { useShops } from "@/lib/supabase/hooks";
import { CartShopSection } from "@/components/cart/CartShopSection";

function OrderHistoryLink() {
  return (
    <Link
      href="/orders"
      className="inline-flex items-center gap-1.5 pill border border-border px-3 py-1.5 text-xs font-bold hover:bg-secondary transition-colors focus-dashed shrink-0"
    >
      <ReceiptText className="w-3.5 h-3.5" /> Order history
    </Link>
  );
}

export default function CartPage() {
  const { items, total, groupedByShop } = useCart();
  const { data: shops = [] } = useShops();
  const router = useRouter();

  const groupedMap = groupedByShop();
  const groupedEntries = Array.from(groupedMap.entries());

  if (items.length === 0) {
    return (
      <div className="flex-1 bg-background flex flex-col">
        <div className="flex justify-end container mx-auto px-4 pt-6 md:pt-24">
          <OrderHistoryLink />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center container mx-auto px-4 pb-16 md:pb-24 text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <img src="/icons/cart-new-black.svg" alt="" className="w-full h-full dark:hidden object-contain" loading="eager" decoding="sync" />
            <img src="/icons/cart-new-white.svg" alt="" className="hidden w-full h-full dark:block object-contain" loading="eager" decoding="sync" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Add items to start a cart</h1>
          <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
            Add a few things from the menu to see them here. Each shop prepares your order separately.
          </p>
          <Link
            href="/browse"
            className="inline-flex mt-8 pill bg-foreground text-background px-6 py-2.5 text-sm font-bold focus-dashed hover:bg-foreground/90 transition-colors"
          >
            Start shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background flex flex-col">
      <div className="flex-1 container mx-auto px-4 pt-8 pb-24 md:pb-32 md:pt-28 grid lg:grid-cols-[1fr_380px] gap-12">
        {/* Left: cart items */}
        <div className="min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="label-mono text-primary">
              {groupedEntries.length > 1 ? "Multi-shop cart" : "Shop cart"}
            </div>
            <OrderHistoryLink />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Review Order</h1>
          <p className="text-muted-foreground mt-1 text-sm max-w-lg">
            Items are grouped by shop. Each shop requires its own payment and will issue a unique pickup code.
          </p>

          <div className="mt-10 space-y-10">
            {groupedEntries.map(([shopId, list]) => {
              const shop = shops.find(s => s.id === shopId);
              if (!shop) return null;

              return <CartShopSection key={shopId} shop={shop} items={list} />;
            })}
          </div>
        </div>

        {/* Right: order summary */}
        <aside className="h-fit">
          <div className="sticky top-24 rounded-[2.5rem] border border-border bg-card p-8">
            <div className="label-mono mb-4 text-primary">Final Summary</div>
            <h2 className="text-2xl font-bold tracking-tight mb-6">
              Total Order
            </h2>

            <div className="space-y-4 mb-8">
              {groupedEntries.map(([id, list]) => {
                const shop = shops.find(s => s.id === id);
                const sub = list.reduce((n, c) => n + c.qty * c.item.price, 0);
                return (
                  <div key={id} className="flex justify-between items-center group">
                    <div className="flex items-center gap-2">
                      <span className="text-lg grayscale group-hover:grayscale-0 transition-all">{shop?.emoji}</span>
                      <span className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">{shop?.name}</span>
                    </div>
                    <span className="font-mono font-bold text-sm">Rs {sub}</span>
                  </div>
                );
              })}
            </div>

            <div className="p-4 rounded-2xl bg-secondary/50 flex items-start gap-3 mb-8 border border-border/50">
              <AlertCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                You will be redirected to process payments for each shop one after another. 
                Orders are only sent to vendors after payment confirmation.
              </p>
            </div>

            <div className="space-y-1 mb-8">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Grand Total</span>
                <span className="font-mono text-3xl font-black text-primary">Rs {total()}</span>
              </div>
            </div>

            <button
              onClick={() => router.push("/checkout")}
              className="w-full inline-flex items-center justify-center gap-3 h-12 text-sm rounded-2xl bg-foreground text-background font-bold hover:bg-foreground/90 transition-colors"
            >
              Check out now <ArrowRight className="w-5 h-5" />
            </button>
            
            <p className="mt-4 text-[10px] text-muted-foreground text-center font-medium uppercase tracking-widest">
              Secured by The Edge checkout
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
