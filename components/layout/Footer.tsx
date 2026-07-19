"use client";

import Link from "next/link";

export const Footer = () => (
  <footer className="border-t border-border mt-10">
    <div className="container mx-auto px-4 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-foreground">The Edge</span>
        <span>· Campus food, sorted.</span>
      </div>
      <div className="flex gap-5">
        <Link href="/vendor/login" className="hover:text-foreground focus-dashed transition-smooth">
          Vendor login
        </Link>
        <Link href="/shop-registration" className="hover:text-foreground focus-dashed transition-smooth">
          Register your shop
        </Link>
      </div>
    </div>
  </footer>
);
