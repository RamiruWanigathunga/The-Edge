"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/store/cart";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";
import { NotificationLink } from "@/components/layout/NotificationLink";
import { QuickThemeToggle } from "@/components/ui/QuickThemeToggle";

export const Header = () => {
  const count = useCart((s) => s.count());
  const toggleDrawer = useCart((s) => s.toggleDrawer);
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/browse", label: "Browse" },
    { href: "/orders", label: "Orders" },
  ];

  return (
    <header
      className={`hidden md:block fixed w-full top-0 z-40 transition-all duration-100 border-b bg-background ${
        scrolled ? "border-border" : "border-transparent"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between h-14">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group" id="header-logo">
          <span className="font-bold tracking-tight text-xl">The Edge</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`focus-dashed transition-smooth hover:text-foreground ${
                pathname === link.href ? "text-foreground font-bold" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3">
            <QuickThemeToggle />
            <button
              type="button"
              onClick={toggleDrawer}
              id="header-cart-btn"
              aria-label="Cart"
              className="relative flex w-8 h-8 items-center justify-center text-muted-foreground transition-smooth focus-dashed"
            >
              <div className="relative w-6 h-6 translate-y-px hover:opacity-70 transition-smooth">
                <img src="/icons/cart-solid-black.svg" alt="Cart" className="w-full h-full dark:hidden object-contain" loading="eager" decoding="sync" />
                <img src="/icons/cart-solid-white.svg" alt="Cart" className="hidden w-full h-full dark:block object-contain" loading="eager" decoding="sync" />
              </div>
              {mounted && count > 0 && (
                <span className="absolute -top-2 -right-2 inline-grid place-items-center min-w-5 h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold animate-scale-in">
                  {count}
                </span>
              )}
            </button>
            <NotificationLink className="w-8 h-8 translate-y-0.5 hover:opacity-70" iconClassName="w-6 h-6" />
            <Link
              href="/profile"
              className="w-8 h-8 overflow-hidden hover:opacity-70 transition-smooth focus-dashed flex items-center justify-center"
              aria-label="Profile"
            >
              <ProfileAvatar className="w-6 h-6" iconSize={20} />
            </Link>
          </div>

        </div>
      </div>
    </header>
  );
};
