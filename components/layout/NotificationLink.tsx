"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSupabaseUser, useUserOrders } from "@/lib/supabase/hooks";
import type { OrderStatus } from "@/lib/types";

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
  const [clearedIds, setClearedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user?.id) {
      setClearedIds(new Set());
      return;
    }

    const readCleared = () => {
      const saved = localStorage.getItem(`edge-cleared-notifications-${user.id}`);
      setClearedIds(new Set(saved ? JSON.parse(saved) : []));
    };

    readCleared();
    window.addEventListener("edge-cleared-notifications-updated", readCleared);
    window.addEventListener("storage", readCleared);
    return () => {
      window.removeEventListener("edge-cleared-notifications-updated", readCleared);
      window.removeEventListener("storage", readCleared);
    };
  }, [user?.id]);

  const hasNotifications = useMemo(
    () => orders.some((order) => notifyingStatuses.has(order.status) && !clearedIds.has(order.id)),
    [orders, clearedIds]
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
