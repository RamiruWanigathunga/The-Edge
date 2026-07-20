"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ListOrdered, Utensils, BarChart3, Settings,
  Check, ChefHat, Bell, TrendingUp, DollarSign,
  Plus, Pencil, Power, Users,
  ArrowLeft, ToggleLeft, ToggleRight, Upload,
  Search, X, RotateCcw, Printer, ChevronRight,
  Clock, MapPin, Hash, User
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { toast } from "sonner";
import { 
  useUpdateOrderStatus, 
  useVendorOrders, 
  useVendorSearch,
  useShopMenuItems,
  useSupabaseUser,
  useVendorShop,
  useUpdateMenuItemDietaryTags
} from "@/lib/supabase/hooks";
import { useSignOut } from "@/lib/supabase/useSignOut";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import type { OrderStatus } from "@/lib/mockData";
import type { VendorOrder } from "@/lib/supabase/data";

type Tab = "orders" | "menu" | "analytics" | "settings";

export default function VendorDashboard() {
  const params = useParams();
  const slug = params?.slug as string;
  const { data: user, isLoading: userLoading } = useSupabaseUser();
  const { data: shop, isLoading: shopLoading } = useVendorShop(slug, user?.id);
  const { data: menuItems = [] } = useShopMenuItems(shop?.id);
  const updateDietaryTags = useUpdateMenuItemDietaryTags(shop?.id);
  const { signOut, isSigningOut } = useSignOut("/vendor/login");
  
  const [tab, setTab] = useState<Tab>("orders");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<"today" | "week" | "month">("today");
  const [selectedOrder, setSelectedOrder] = useState<VendorOrder | null>(null);
  const [undoOrder, setUndoOrder] = useState<{ id: string, prevStatus: OrderStatus } | null>(null);

  // Live orders query
  const { data: liveOrders = [], isLoading: ordersLoading } = useVendorOrders(shop?.id, dateFilter);
  
  // Search query (only active if debouncedQuery has value)
  const { data: searchResults = [] } = useVendorSearch(shop?.id, debouncedQuery, dateFilter);

  const updateOrderStatusMutation = useUpdateOrderStatus();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const ordersToDisplay = debouncedQuery ? searchResults : liveOrders;

  const handleUpdateStatus = async (orderId: string, status: OrderStatus, prevStatus?: OrderStatus) => {
    try {
      await updateOrderStatusMutation.mutateAsync({ orderId, status });
      
      if (status === "ready" && prevStatus) {
        setUndoOrder({ id: orderId, prevStatus });
        toast.success("Order marked as ready", {
          action: {
            label: "Undo",
            onClick: () => handleUndo(orderId, prevStatus)
          },
          duration: 5000
        });
        // Clear undo after 5s
        setTimeout(() => setUndoOrder(null), 5000);
      } else {
        toast.success(`Order marked as ${status}`);
      }
    } catch (e) {
      toast.error("Failed to update status");
    }
  };

  const handleUndo = async (orderId: string, prevStatus: OrderStatus) => {
    try {
      await updateOrderStatusMutation.mutateAsync({ orderId, status: prevStatus });
      setUndoOrder(null);
      toast.success("Action undone");
    } catch (e) {
      toast.error("Failed to undo");
    }
  };

  const toggleDietaryTag = async (menuItemId: string, currentTags: string[], tag: "Vegan" | "Vegetarian") => {
    const nextTags = currentTags.includes(tag)
      ? currentTags.filter((itemTag) => itemTag !== tag)
      : [...currentTags, tag];

    try {
      await updateDietaryTags.mutateAsync({ menuItemId, dietaryTags: nextTags });
      toast.success("Product tags updated");
    } catch {
      toast.error("Failed to update product tags");
    }
  };

  if (userLoading || shopLoading) {
    return (
      <div className="flex-1 grid place-items-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground animate-pulse">Loading vendor portal...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 grid place-items-center bg-background px-4">
        <div className="max-w-md rounded-3xl border border-border bg-card p-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Vendor sign in required</h1>
          <p className="text-muted-foreground mt-3">Use the Google account approved for this shop.</p>
          <Link href="/vendor/login" className="pill bg-foreground text-background px-5 py-3 inline-flex mt-6">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="flex-1 grid place-items-center bg-background px-4">
        <div className="max-w-md rounded-3xl border border-border bg-card p-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight">No approved access</h1>
          <p className="text-muted-foreground mt-3">
            This shop is not approved for your Google account, or the shop does not exist.
          </p>
          <Link href="/vendor" className="pill bg-foreground text-background px-5 py-3 inline-flex mt-6">
            View my shops
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-secondary/20 flex overflow-hidden">
      {/* ── SIDEBAR (Desktop) ── */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-background h-screen z-30">
        <div className="p-6 border-b border-border bg-card/50">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-xl hero-gradient grid place-items-center text-white font-bold text-sm">E</div>
            <span className="font-bold tracking-tight">The Edge</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-secondary grid place-items-center text-2xl shadow-inner">{shop.emoji}</div>
            <div className="min-w-0">
              <div className="font-bold truncate text-sm">{shop.name}</div>
              <div className={`text-[10px] flex items-center gap-1.5 font-bold uppercase tracking-wider ${shop.isOpen ? "text-success" : "text-muted-foreground"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${shop.isOpen ? "bg-success animate-pulse" : "bg-muted-foreground"}`} />
                {shop.isOpen ? "Live" : "Offline"}
              </div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2 mt-4">
          {[
            { id: "orders", label: "Live Orders", icon: ListOrdered },
            { id: "menu", label: "Menu Items", icon: Utensils },
            { id: "analytics", label: "Insights", icon: BarChart3 },
            { id: "settings", label: "Store Settings", icon: Settings },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as Tab)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                tab === t.id
                  ? "bg-foreground text-background shadow-lg shadow-foreground/10 scale-[1.02]"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-border">
          <button onClick={signOut} disabled={isSigningOut} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50">
            <Power className="w-3 h-3" /> {isSigningOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Mobile Header / Tab Bar */}
        <header className="lg:hidden bg-background border-b border-border p-4 sticky top-0 z-20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
               <div className="text-xl">{shop.emoji}</div>
               <span className="font-bold text-sm truncate">{shop.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${shop.isOpen ? "bg-success/10 text-success border border-success/20" : "bg-muted text-muted-foreground"}`}>
                {shop.isOpen ? "Accepting Orders" : "Closed"}
              </div>
              <button
                onClick={signOut}
                disabled={isSigningOut}
                className="w-8 h-8 rounded-full bg-secondary grid place-items-center text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                aria-label="Sign out"
                title="Sign out"
              >
                <Power className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {["orders", "menu", "analytics", "settings"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t as Tab)}
                className={`px-4 py-2 rounded-full text-[11px] font-bold whitespace-nowrap border capitalize transition-all ${
                  tab === t 
                    ? "bg-foreground text-background border-foreground shadow-sm" 
                    : "bg-secondary/50 text-muted-foreground border-transparent"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </header>

        {/* Global Toolbar */}
        <div className="bg-background/80 backdrop-blur-md border-b border-border px-6 py-4 flex items-center justify-between z-10 sticky top-0 hidden lg:flex">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold capitalize">{tab === "orders" ? "Orders Feed" : tab}</h1>
            {tab === "orders" && (
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Code, Ref, or Name..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 rounded-full bg-secondary/50 border-none h-10 text-sm focus-visible:ring-1 focus-visible:ring-primary"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X className="w-3 h-3 text-muted-foreground" />
                  </button>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-secondary/50 rounded-full p-1 border border-border">
              {["today", "week", "month"].map((f) => (
                <button
                  key={f}
                  onClick={() => setDateFilter(f as any)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                    dateFilter === f ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="w-px h-6 bg-border mx-2" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Store Status</span>
              <button 
                onClick={() => toast.info("Use settings to change store status")}
                className={`w-10 h-6 rounded-full relative transition-colors ${shop.isOpen ? "bg-success" : "bg-muted"}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${shop.isOpen ? "left-5" : "left-1"}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          
          {/* ── ORDERS TAB ── */}
          {tab === "orders" && (
            <div className="flex flex-col lg:flex-row gap-8 h-full">
              {/* Order Lists */}
              <div className="flex-1 space-y-8">
                <div className="grid md:grid-cols-2 gap-6 h-full content-start">
                  
                  {/* COLUMN: PREPARING */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-2">
                        <ChefHat className="w-4 h-4 text-primary" />
                        <h2 className="font-bold text-sm uppercase tracking-widest">New / Preparing</h2>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                        {ordersToDisplay.filter(o => o.status === "paid" || o.status === "preparing").length}
                      </span>
                    </div>
                    
                    <div className="space-y-4">
                      {ordersToDisplay.filter(o => o.status === "paid" || o.status === "preparing").map((o) => (
                        <OrderCard 
                          key={o.id} 
                          order={o} 
                          onClick={() => setSelectedOrder(o)}
                          onStatusChange={handleUpdateStatus}
                          isActive={selectedOrder?.id === o.id}
                        />
                      ))}
                      {ordersToDisplay.filter(o => o.status === "paid" || o.status === "preparing").length === 0 && (
                        <EmptyState message="All caught up!" icon={Check} />
                      )}
                    </div>
                  </div>

                  {/* COLUMN: READY */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-success" />
                        <h2 className="font-bold text-sm uppercase tracking-widest">Ready for Pickup</h2>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-success/10 text-success text-[10px] font-bold">
                        {ordersToDisplay.filter(o => o.status === "ready").length}
                      </span>
                    </div>

                    <div className="space-y-4">
                      {ordersToDisplay.filter(o => o.status === "ready").map((o) => (
                        <OrderCard 
                          key={o.id} 
                          order={o} 
                          onClick={() => setSelectedOrder(o)}
                          onStatusChange={handleUpdateStatus}
                          isActive={selectedOrder?.id === o.id}
                        />
                      ))}
                      {ordersToDisplay.filter(o => o.status === "ready").length === 0 && (
                        <EmptyState message="Nothing ready yet" icon={Clock} />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Receipt Preview Pane (Desktop) */}
              <AnimatePresence>
                {selectedOrder && (
                  <motion.div 
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 20, opacity: 0 }}
                    className="hidden lg:block w-[400px] bg-background border border-border rounded-[2.5rem] p-6 shadow-2xl sticky top-0 h-fit"
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold uppercase tracking-widest text-xs text-muted-foreground">Receipt Preview</h3>
                      <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-secondary rounded-full">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <ReceiptPreview order={selectedOrder} />
                    <div className="mt-8 flex gap-3">
                       <Button variant="outline" className="flex-1 pill h-12" onClick={() => window.print()}>
                         <Printer className="w-4 h-4 mr-2" /> Print Ticket
                       </Button>
                       {selectedOrder.status === "ready" ? (
                         <Button className="flex-1 pill h-12 bg-success hover:bg-success/90" onClick={() => handleUpdateStatus(selectedOrder.id, "completed")}>
                           <Check className="w-4 h-4 mr-2" /> Complete
                         </Button>
                       ) : (
                         <Button className="flex-1 pill h-12 bg-foreground text-background" onClick={() => handleUpdateStatus(selectedOrder.id, "ready", "preparing")}>
                           <Bell className="w-4 h-4 mr-2" /> Make Ready
                         </Button>
                       )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {tab === "menu" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Menu items</h2>
                <p className="text-sm text-muted-foreground mt-1">Mark products as vegan or vegetarian.</p>
              </div>

              <div className="grid gap-4">
                {menuItems.map((item) => (
                  <div key={item.id} className="rounded-3xl border border-border bg-card p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <div className="font-bold tracking-tight truncate">{item.title}</div>
                      <div className="text-sm text-muted-foreground mt-1">{item.category} · Rs {item.price.toFixed(0)}</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(["Vegan", "Vegetarian"] as const).map((tag) => {
                        const active = item.dietaryTags.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleDietaryTag(item.id, item.dietaryTags, tag)}
                            disabled={updateDietaryTags.isPending}
                            className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-widest transition-smooth disabled:opacity-60 ${
                              active
                                ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300"
                                : "border-border bg-secondary/50 text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {active && <Check className="mr-1.5 inline h-3.5 w-3.5" />}
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {menuItems.length === 0 && (
                  <EmptyState message="No menu items yet" icon={Utensils} />
                )}
              </div>
            </div>
          )}

          {/* Other tabs remain placeholders for now or can be ported later */}
          {tab !== "orders" && tab !== "menu" && (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground italic">
               <p>Section &ldquo;{tab}&rdquo; under reconstruction for multi-shop flow.</p>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Receipt Bottom Sheet */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="lg:hidden fixed inset-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-sm p-4">
             <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                className="w-full max-w-md bg-background border border-border rounded-t-[2.5rem] shadow-2xl p-6 overflow-y-auto max-h-[90vh]"
             >
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-1 bg-secondary rounded-full" />
                </div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold">Order Details</h3>
                  <button onClick={() => setSelectedOrder(null)} className="p-2 bg-secondary rounded-full">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <ReceiptPreview order={selectedOrder} />
                <div className="mt-8 space-y-3">
                   <Button className="w-full pill h-14 bg-foreground text-background" onClick={() => handleUpdateStatus(selectedOrder.id, selectedOrder.status === "ready" ? "completed" : "ready", selectedOrder.status)}>
                      {selectedOrder.status === "ready" ? "Mark as Completed" : "Mark as Ready"}
                   </Button>
                   <Button variant="outline" className="w-full pill h-14" onClick={() => setSelectedOrder(null)}>
                      Close
                   </Button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── SUB-COMPONENTS ──

function OrderCard({ 
  order, 
  onClick, 
  onStatusChange,
  isActive 
}: { 
  order: VendorOrder, 
  onClick: () => void,
  onStatusChange: (id: string, status: OrderStatus, prev?: OrderStatus) => void,
  isActive: boolean
}) {
  return (
    <motion.div 
      layout
      onClick={onClick}
      className={`group relative rounded-3xl border p-5 cursor-pointer transition-all ${
        isActive 
          ? "bg-foreground text-background border-foreground shadow-2xl scale-[1.02] z-10" 
          : "bg-card border-border hover:border-primary/50 hover:shadow-lg shadow-sm"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className={`font-mono font-black text-lg tracking-tighter ${isActive ? "text-primary" : "text-primary"}`}>
            #{order.code}
          </span>
          {order.scheduledSlot !== "ASAP" && (
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1 ${isActive ? "bg-white/10 text-white" : "bg-secondary text-muted-foreground"}`}>
              <Clock className="w-2.5 h-2.5" /> {order.scheduledSlot}
            </span>
          )}
        </div>
        <span className={`text-[10px] font-medium ${isActive ? "text-background/60" : "text-muted-foreground"}`}>
          {order.time}
        </span>
      </div>

      <div className="space-y-1.5 mb-4">
        {order.itemDetails.map((it, idx) => (
          <div key={idx} className="flex justify-between items-start gap-4">
            <span className={`text-sm font-semibold line-clamp-1 ${isActive ? "text-background" : "text-foreground"}`}>
              {it.quantity}× {it.title}
            </span>
            <span className={`font-mono text-xs ${isActive ? "text-background/70" : "text-muted-foreground"}`}>
              Rs {it.quantity * it.unitPrice}
            </span>
          </div>
        ))}
      </div>

      {order.note && (
        <div className={`text-[11px] rounded-xl px-3 py-2 mb-4 italic ${isActive ? "bg-white/10 text-white/90" : "bg-warning/10 text-warning-foreground"}`}>
          &ldquo;{order.note}&rdquo;
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-current/10">
        <div className="flex items-center gap-2">
           <User className="w-3 h-3 opacity-60" />
           <span className="text-[11px] font-bold uppercase tracking-widest">{order.customerName}</span>
        </div>
        
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          {order.status !== "ready" ? (
            <button
              onClick={() => onStatusChange(order.id, "ready", "preparing")}
              className={`pill text-[10px] font-bold px-4 py-2 transition-all ${
                isActive 
                  ? "bg-primary text-primary-foreground hover:bg-primary-glow" 
                  : "bg-foreground text-background hover:bg-foreground/80"
              }`}
            >
              Make Ready
            </button>
          ) : (
            <button
              onClick={() => onStatusChange(order.id, "completed")}
              className={`pill text-[10px] font-bold px-4 py-2 transition-all ${
                isActive 
                  ? "bg-success text-success-foreground hover:opacity-90" 
                  : "bg-success text-success-foreground hover:opacity-90"
              }`}
            >
              Complete
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ReceiptPreview({ order }: { order: VendorOrder }) {
  const formattedRef = order.referenceNumber.replace(/^RF (\d{4}) (\d{6}) (\d{4})$/, "#RF $1 $2 $3");

  return (
    <div className="receipt-print-container bg-white text-black p-8 rounded-lg shadow-inner font-sans border-2 border-dashed border-gray-200">
      <div className="text-center mb-6">
        <h4 className="font-black text-xl tracking-tighter uppercase mb-1">Order Ticket</h4>
        <div className="text-[10px] text-gray-500 uppercase tracking-widest">{order.createdAt}</div>
      </div>

      <div className="flex flex-col items-center mb-8 py-6 border-y-2 border-black border-dashed">
        <div className="text-[10px] font-bold uppercase tracking-widest mb-1 text-gray-500">Pickup Code</div>
        <div className="text-6xl font-black tracking-tighter">{order.code}</div>
      </div>

      <div className="space-y-4 mb-8">
        <div className="flex justify-between items-end border-b border-gray-100 pb-2">
          <span className="text-[10px] font-bold uppercase text-gray-400">Customer</span>
          <span className="font-bold text-sm">{order.customerName}</span>
        </div>
        <div className="flex justify-between items-end border-b border-gray-100 pb-2">
          <span className="text-[10px] font-bold uppercase text-gray-400">Scheduled For</span>
          <span className="font-bold text-sm">{order.scheduledSlot}</span>
        </div>
      </div>

      <div className="space-y-3 mb-8">
        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Order Items</div>
        {order.itemDetails.map((it, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="font-bold">{it.quantity}× {it.title}</span>
            <span className="font-mono">Rs {it.quantity * it.unitPrice}</span>
          </div>
        ))}
        <div className="pt-4 border-t-2 border-black border-dotted flex justify-between items-center">
          <span className="font-black uppercase text-sm">Total Paid</span>
          <span className="font-mono font-black text-lg">Rs {order.total}</span>
        </div>
      </div>

      {order.note && (
        <div className="bg-gray-50 p-3 rounded-md mb-8">
          <div className="text-[10px] font-bold uppercase text-gray-400 mb-1">Notes</div>
          <p className="text-xs italic leading-relaxed">&ldquo;{order.note}&rdquo;</p>
        </div>
      )}

      <div className="text-center pt-4 border-t border-gray-100">
        <div className="text-[10px] font-bold text-gray-400 mb-1">REFERENCE NUMBER</div>
        <div className="font-mono text-[11px] font-bold tracking-tighter">{formattedRef}</div>
      </div>
      
      <div className="mt-8 flex justify-center opacity-10">
        <div className="w-12 h-12 border-4 border-black rounded-full" />
      </div>
    </div>
  );
}

function EmptyState({ message, icon: Icon }: { message: string, icon: any }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 rounded-[2.5rem] bg-background/40 border-2 border-dashed border-border/50 text-muted-foreground">
      <div className="w-12 h-12 rounded-2xl bg-secondary/50 grid place-items-center mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}
