"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, ShoppingBag, ReceiptText, User } from "lucide-react";
import { useCart } from "@/store/cart";
import { motion } from "framer-motion";

export const BottomNav = () => {
  const pathname = usePathname();
  const count = useCart((s) => s.count());
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/browse", label: "Browse", icon: Compass },
    { href: "/cart", label: "Cart", icon: ShoppingBag, badge: true },
    { href: "/orders", label: "Orders", icon: ReceiptText },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-t border-border/50 pb-safe">
      <div className="flex items-center justify-evenly h-16 w-full px-2">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className="relative flex flex-col items-center justify-center w-full h-full gap-1 transition-smooth active:scale-95"
            >
              <div className="relative">
                {link.label === "Cart" ? (
                  <div className={`relative w-7 h-7 transition-all ${isActive ? "drop-shadow-[0_0_8px_rgba(34,197,94,0.5)] brightness-150" : ""}`}>
                    <img src="/icons/cart-black.svg" alt="Cart" className="w-full h-full dark:hidden object-contain" loading="eager" decoding="sync" />
                    <img src="/icons/cart-white.svg" alt="Cart" className="hidden w-full h-full dark:block object-contain" loading="eager" decoding="sync" />
                  </div>
                ) : link.label === "Profile" ? (
                  <div className={`relative w-7 h-7 transition-all ${isActive ? "drop-shadow-[0_0_8px_rgba(34,197,94,0.5)] brightness-150" : ""}`}>
                    <img src="/images/profile-black.svg" alt="Profile" className="w-full h-full dark:hidden object-contain" loading="eager" decoding="sync" />
                    <img src="/images/profile-white.svg" alt="Profile" className="hidden w-full h-full dark:block object-contain" loading="eager" decoding="sync" />
                  </div>
                ) : link.label === "Home" ? (
                  <div className={`relative w-7 h-7 transition-all ${isActive ? "drop-shadow-[0_0_8px_rgba(34,197,94,0.5)] brightness-150" : ""}`}>
                    <img src="/icons/home-black.svg" alt="Home" className="w-full h-full dark:hidden object-contain" loading="eager" decoding="sync" />
                    <img src="/icons/home-white.svg" alt="Home" className="hidden w-full h-full dark:block object-contain" loading="eager" decoding="sync" />
                  </div>
                ) : (
                  <Icon
                    className={`w-5 h-5 transition-all ${
                      isActive ? "text-primary drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "text-muted-foreground"
                    }`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                )}
                {link.badge && mounted && count > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground animate-scale-in">
                    {count}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] text-foreground transition-all ${
                  isActive ? "font-semibold" : "font-medium"
                }`}
              >
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
