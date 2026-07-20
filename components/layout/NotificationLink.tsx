"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSupabaseUser, useUserOrders } from "@/lib/supabase/hooks";
import type { OrderStatus } from "@/lib/mockData";

const notifyingStatuses = new Set<OrderStatus>(["paid", "preparing", "ready", "customer_late"]);

type NotificationLinkProps = {
  className?: string;
  iconClassName?: string;
};

export function NotificationLink({
  className = "",
  iconClassName = "w-6 h-6",
}: NotificationLinkProps) {
  const { data: user } = useSupabaseUser();
  const { data: orders = [] } = useUserOrders(user?.id);

  const hasNotifications = useMemo(
    () => orders.some((order) => notifyingStatuses.has(order.status)),
    [orders]
  );

  const lightIcon = hasNotifications
    ? "/icons/notification-dot-black.svg"
    : "/icons/notification-black.svg";
  const darkIcon = hasNotifications
    ? "/icons/notification-dot-white.svg"
    : "/icons/notification-white.svg";

  return (
    <Link
      href="/notifications"
      aria-label="Notifications"
      className={`relative flex items-center justify-center transition-smooth focus-dashed ${className}`}
    >
      <span className={`relative block ${iconClassName}`}>
        <img src={lightIcon} alt="" className="w-full h-full dark:hidden object-contain" loading="eager" decoding="sync" />
        <img src={darkIcon} alt="" className="hidden w-full h-full dark:block object-contain" loading="eager" decoding="sync" />
      </span>
    </Link>
  );
}
