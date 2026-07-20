"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, ChevronRight, X, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/store/cart";
import { useProfile } from "@/store/profile";
import { useCreateOrder, useShops, useSupabaseUser } from "@/lib/supabase/hooks";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function CheckoutPage() {
  const { items, clearShop, groupedByShop } = useCart();
  const { name: profileName } = useProfile();
  const { data: user } = useSupabaseUser();
  const { data: shops } = useShops();
  const { mutateAsync: createOrder } = useCreateOrder();
  
  const [currentShopId, setCurrentShopId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");
  const router = useRouter();

  const groupedMap = groupedByShop();
  const shopIds = Array.from(groupedMap.keys());
  
  const handleStartPayment = (shopId: string) => {
    setCurrentShopId(shopId);
  };

  const handleConfirmPayment = async (shopId: string) => {
    const shopItems = groupedMap.get(shopId) || [];
    const shop = shops?.find(s => s.id === shopId);
    
    if (!shop || shopItems.length === 0) return;

    setLoading(true);
    try {
      const result = await createOrder({
        userId: user?.id || null,
        shopId: shopId,
        total: shopItems.reduce((n, c) => n + c.qty * c.item.price, 0),
        customerName: profileName || (user?.email?.split('@')[0]) || "Guest",
        note: note,
        items: shopItems.map(c => ({
          menu_item_id: c.item.id,
          title: c.item.title,
          image_url: c.item.image,
          qty: c.qty,
          price: c.item.price,
          notes: c.notes,
          dining: c.dining
        }))
      });

      // Clear ONLY this shop from cart
      clearShop(shopId);
      setCurrentShopId(null);
      
      toast.success(`Order confirmed for ${shop.name}! Code: ${result.daily_code}`);
      
      // If that was the last shop, go to the receipt
      if (shopIds.length <= 1) {
        router.push(`/order/${encodeURIComponent(result.reference_number)}`);
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to create order";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex-1 bg-background flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Your cart is empty</h1>
          <p className="text-muted-foreground">Looks like you&apos;ve already checked out or cleared your cart.</p>
          <Button onClick={() => router.push("/")} className="pill px-8">
            Go back to shops
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background pb-24">
      <div className="container mx-auto px-4 py-8 md:pt-28 max-w-2xl">
        <div className="label-mono mb-2 text-primary">● Sequential Checkout</div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-8">Process Payments</h1>

        <div className="space-y-6">
          {shopIds.map((shopId) => {
            const shop = shops?.find(s => s.id === shopId);
            const shopItems = groupedMap.get(shopId) || [];
            const subtotal = shopItems.reduce((n, c) => n + c.qty * c.item.price, 0);

            if (!shop) return null;

            return (
              <motion.div 
                key={shopId}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-border bg-card overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{shop.emoji}</span>
                      <div>
                        <h2 className="font-bold text-lg">{shop.name}</h2>
                        <p className="text-xs text-muted-foreground">{shopItems.length} items</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-xl text-primary">Rs {subtotal}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Subtotal</div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    {shopItems.map((c) => (
                      <div key={c.item.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {c.qty}× {c.item.title}
                          {c.notes && <span className="text-[10px] block italic">&ldquo;{c.notes}&rdquo;</span>}
                        </span>
                        <span className="font-mono text-muted-foreground">Rs {c.qty * c.item.price}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    onClick={() => handleStartPayment(shopId)}
                    className="w-full pill bg-foreground text-background hover:bg-foreground/90 h-12"
                  >
                    Pay for {shop.name} <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </motion.div>
            );
          })}

          <section className="rounded-3xl border border-border bg-card p-6">
            <h2 className="font-semibold tracking-tight mb-3 text-sm uppercase tracking-wider text-muted-foreground">Order notes</h2>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any specific instructions for the vendors?"
              className="w-full text-sm px-4 py-3 rounded-2xl bg-secondary border-none resize-none focus:ring-1 focus:ring-primary outline-none transition-all h-24"
            />
          </section>
        </div>
      </div>

      {/* Payment Step Modal */}
      <AnimatePresence>
        {currentShopId && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-background/80 p-4">
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-md bg-card border border-border rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="label-mono text-primary mb-1 text-[10px]">Payment Step</div>
                    <h2 className="text-2xl font-bold">Confirm Payment</h2>
                  </div>
                  <button 
                    onClick={() => setCurrentShopId(null)}
                    className="p-2 hover:bg-secondary rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {(() => {
                  const shop = shops?.find(s => s.id === currentShopId);
                  const shopItems = groupedMap.get(currentShopId) || [];
                  const subtotal = shopItems.reduce((n, c) => n + c.qty * c.item.price, 0);
                  
                  return (
                    <div className="space-y-6">
                      <div className="bg-secondary/50 rounded-3xl p-6 text-center">
                        <div className="text-4xl mb-2">{shop?.emoji}</div>
                        <div className="text-xl font-bold mb-1">{shop?.name}</div>
                        <div className="font-mono text-3xl font-black text-primary">Rs {subtotal}</div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-start gap-3 p-4 rounded-2xl bg-primary/5 text-primary text-xs leading-relaxed border border-primary/10">
                          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <p>Please open the shop&apos;s payment link and complete the transfer. Once done, come back here to confirm.</p>
                        </div>

                        <a 
                          href={shop?.paymentLink || "#"} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full h-14 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
                        >
                          Open Payment Link <ExternalLink className="w-4 h-4" />
                        </a>

                        <div className="relative py-2">
                          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
                          <div className="relative flex justify-center text-[10px] uppercase tracking-widest"><span className="bg-card px-3 text-muted-foreground">Then confirm below</span></div>
                        </div>

                        <Button 
                          onClick={() => handleConfirmPayment(currentShopId)}
                          disabled={loading}
                          className="w-full h-14 rounded-2xl bg-foreground text-background font-bold hover:bg-foreground/90 disabled:opacity-50"
                        >
                          {loading ? (
                            <span className="flex items-center gap-2">
                              <span className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                              Verifying...
                            </span>
                          ) : (
                            "I have made the payment"
                          )}
                        </Button>
                        
                        <button 
                          onClick={() => setCurrentShopId(null)}
                          className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
                        >
                          Cancel and go back
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
