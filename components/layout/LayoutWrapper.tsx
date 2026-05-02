"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  // Hide global navigation on login and vendor dashboard pages
  const isLoginPage = pathname === "/login";
  const isVendorPage = pathname.startsWith("/vendor");
  const isAuthPage = pathname === "/auth" || pathname.startsWith("/auth/");
  
  useEffect(() => {
    // Simulated frontend auth guard
    const isOnboarded = localStorage.getItem("edge-onboarded");
    if (!isOnboarded && !isLoginPage && !isVendorPage && !isAuthPage) {
      router.push("/auth");
    }
  }, [pathname, isLoginPage, isVendorPage, isAuthPage, router]);
  
  const hideNav = isLoginPage || isVendorPage || isAuthPage;

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
