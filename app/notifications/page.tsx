"use client";

import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { useMemo } from "react";
import { useSupabaseUser, useUserOrders } from "@/lib/supabase/hooks";
import type { OrderStatus } from "@/lib/mockData";

const notifyingStatuses = new Set<OrderStatus>(["paid", "preparing", "ready", "customer_late"]);

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getDateLabel(value: string) {
  const date = new Date(value);
  const today = startOfDay(new Date());
  const notificationDay = startOfDay(date);
  const diffDays = Math.round((today.getTime() - notificationDay.getTime()) / 86400000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function NotificationsPage() {
  const { data: user } = useSupabaseUser();
  const { data: orders = [], isLoading } = useUserOrders(user?.id);
  const pageClassName = "flex-1 bg-background flex flex-col animate-slide-in-right md:animate-none";

  const notifications = useMemo(
    () => orders.filter((order) => notifyingStatuses.has(order.status)),
    [orders]
  );
  const groupedNotifications = useMemo(() => {
    return notifications.reduce<Array<{ label: string; orders: typeof notifications }>>((groups, order) => {
      const label = getDateLabel(order.createdAt);
      const existing = groups.find((group) => group.label === label);

      if (existing) {
        existing.orders.push(order);
      } else {
        groups.push({ label, orders: [order] });
      }

      return groups;
    }, []);
  }, [notifications]);

  if (isLoading) {
    return (
      <div className={pageClassName}>
        <div className="flex-1 container mx-auto px-4 py-20 md:pt-36 text-center">
          <div className="animate-pulse inline-flex items-center gap-2 text-muted-foreground font-medium">
            <div className="w-1.5 h-1.5 rounded-full bg-current" />
            <div className="w-1.5 h-1.5 rounded-full bg-current" />
            <div className="w-1.5 h-1.5 rounded-full bg-current" />
            Loading notifications...
          </div>
        </div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className={pageClassName}>
        <div className="flex-1 container mx-auto px-4 py-20 md:pt-36 text-center">
          <div className="w-24 h-24 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="relative w-10 h-10">
              <img src="/icons/notification-black.svg" alt="" className="w-full h-full dark:hidden object-contain" loading="eager" decoding="sync" />
              <img src="/icons/notification-white.svg" alt="" className="hidden w-full h-full dark:block object-contain" loading="eager" decoding="sync" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">No notifications yet</h1>
          <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
            Updates about your active orders will appear here.
          </p>
          <Link
            href="/browse"
            className="inline-flex mt-8 pill bg-foreground text-background px-6 py-2.5 text-sm font-bold focus-dashed hover:bg-foreground/90 transition-smooth shadow-pop"
          >
            Start shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={pageClassName}>
      <main className="flex-1 container mx-auto px-4 pt-8 pb-24 md:pb-32 md:pt-28 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Notifications</h1>
          <p className="text-muted-foreground">Active updates from your orders.</p>
        </div>

        <div className="space-y-8">
          {groupedNotifications.map((group) => (
            <section key={group.label} className="space-y-3">
              <h2 className="px-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {group.label}
              </h2>
              <div className="space-y-4">
                {group.orders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/order/${encodeURIComponent(order.referenceNumber)}`}
                    className="flex items-center justify-between gap-4 rounded-3xl border border-border bg-card p-5 shadow-soft transition-smooth hover:border-muted-foreground/50 focus-dashed"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-secondary grid place-items-center shrink-0">
                        <Clock className="w-5 h-5 text-foreground" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{order.shopName}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          Order {order.code} is {order.status?.replace("_", " ") || "active"}
                        </div>
                        <div className="text-[11px] text-muted-foreground/80 mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
