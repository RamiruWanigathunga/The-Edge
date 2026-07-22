"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { CartDrawer } from "@/components/cart/CartDrawer";

import { OfflineBanner } from "@/components/ui/OfflineBanner";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  // Hide global navigation on login and vendor dashboard pages
  const isLoginPage = pathname === "/login";
  const isSignupPage = pathname === "/signup";
  const isRegistrationPage = pathname === "/shop-registration";
  const isVendorPage = pathname.startsWith("/vendor");
  const isAuthPage = pathname === "/auth" || pathname.startsWith("/auth/");
  
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setLoading(false);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user && !isLoginPage && !isSignupPage && !isRegistrationPage && !isVendorPage && !isAuthPage) {
        router.replace("/login");
      } else {
        setLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router, isLoginPage, isSignupPage, isRegistrationPage, isVendorPage, isAuthPage]);
  
  const hideNav = isLoginPage || isSignupPage || isRegistrationPage || isVendorPage || isAuthPage;

  if (loading && !hideNav) {
    return <div className="flex-1 bg-background" />;
  }

  if (hideNav) {
    return (
      <>
        {children}
        <OfflineBanner />
      </>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 flex flex-col pb-20 md:pb-0">
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </div>
      <BottomNav />
      <CartDrawer />
      <OfflineBanner />
    </div>
  );
}
