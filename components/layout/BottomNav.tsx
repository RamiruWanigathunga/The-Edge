"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useCart } from "@/store/cart";
import { HomeIcon, SearchIcon, CartIcon, ProfileIcon } from "@/components/ui/NavIcons";

const BUBBLE =
  "bg-white dark:bg-neutral-900 shadow-[0_8px_24px_rgba(0,0,0,0.15)]";

const navItems = [
  { href: "/", label: "Home", Icon: HomeIcon },
  { href: "/browse", label: "Search", Icon: SearchIcon },
  { href: "/cart", label: "Cart", Icon: CartIcon },
  { href: "/profile", label: "Profile", Icon: ProfileIcon },
] as const;

const SLIDE_TRANSITION = { type: "spring" as const, stiffness: 320, damping: 34 };

export const BottomNav = () => {
  const count = useCart((s) => s.count());
  const isBottomSheetOpen = useCart((s) => s.isBottomSheetOpen);
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);
  const [scrollHidden, setScrollHidden] = React.useState(false);
  const lastY = React.useRef(0);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Hide on scroll-down, reveal immediately on any small scroll-up — no delay,
  // no waiting to reach the top of the page.
  React.useEffect(() => {
    lastY.current = window.scrollY;

    const handleScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY.current;

      if (y < 40) {
        setScrollHidden(false);
      } else if (delta > 8) {
        setScrollHidden(true);
      } else if (delta < -8) {
        setScrollHidden(false);
      }
      lastY.current = y;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const hidden = scrollHidden || isBottomSheetOpen;
  const colorClass = (active: boolean) => (active ? "text-foreground" : "text-muted-foreground");

  return (
    <div className="md:hidden fixed inset-x-0 bottom-0 z-50 pointer-events-none">
      {/* Gradient stays flush with the true bottom of the screen at all times — it only
          fades in/out, it never travels, so it can never fall short of the screen edge. */}
      <motion.div
        animate={{ opacity: hidden ? 0 : 1 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background via-background/80 to-transparent"
      />

      <div style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 28px)" }}>
        <motion.div
          animate={{ y: hidden ? 220 : 0 }}
          transition={SLIDE_TRANSITION}
          className="relative flex items-center justify-center"
        >
          <div className="flex items-center gap-4 pointer-events-auto">
            {navItems.map(({ href, label, Icon }) => {
              const isActive = pathname === href;
              const expanded = mounted && isActive;

              return (
                <motion.div
                  key={href}
                  layout
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  className="shrink-0"
                >
                  <Link
                    href={href}
                    aria-label={label}
                    className={`relative h-14 rounded-full ${BUBBLE} flex items-center justify-center gap-2 active:scale-95 transition-smooth overflow-hidden ${
                      expanded ? "px-6" : "w-14"
                    }`}
                  >
                    <Icon filled={isActive} className={`w-6 h-6 shrink-0 ${colorClass(isActive)}`} />
                    {expanded && (
                      <motion.span
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.12, duration: 0.2 }}
                        className="text-sm font-bold text-foreground whitespace-nowrap"
                      >
                        {label}
                      </motion.span>
                    )}
                    {href === "/cart" && mounted && count > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground animate-scale-in">
                        {count}
                      </span>
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
