"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Hide global navigation on login and vendor dashboard pages
  const isLoginPage = pathname === "/login";
  const isVendorPage = pathname.startsWith("/vendor");
  const isAuthCallback = pathname.startsWith("/auth");
  
  const hideNav = isLoginPage || isVendorPage || isAuthCallback;

  if (hideNav) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 pb-20 md:pb-0">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
