"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Briefcase, LayoutDashboard, ShieldCheck, ArrowRight, Store } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { useSupabaseUser, useMyApprovedShops } from "@/lib/supabase/hooks";
import { getLastAccount, type LastAccount } from "@/lib/lastAccount";

export default function VendorLoginPage() {
  const router = useRouter();
  const { data: user } = useSupabaseUser();
  const { data: shops = [], isLoading: shopsLoading } = useMyApprovedShops(user?.id);
  const [lastAccount, setLastAccountState] = useState<LastAccount | null>(null);

  useEffect(() => {
    setLastAccountState(getLastAccount());
  }, []);

  useEffect(() => {
    if (user && !shopsLoading && shops.length > 0) {
      router.replace("/vendor");
    }
  }, [user, shops, shopsLoading, router]);

  return (
    <div className="flex-1 bg-background flex flex-col lg:flex-row overflow-hidden selection:bg-primary selection:text-primary-foreground">
      {/* 
        Vendor Portal: Side-by-side layout for desktop, single column for mobile/tablet.
        Professional aesthetic with a focus on business management.
      */}
      <div className="flex-1 flex flex-col lg:flex-row w-full h-full min-h-screen">
        
        {/* Auth Block */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 flex flex-col justify-between p-8 md:p-16 lg:p-24 bg-background relative z-10"
        >
          <header className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="font-bold tracking-tighter text-xl">The Edge</span>
              <span className="px-2 py-0.5 rounded-md bg-secondary text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
                Vendor
              </span>
            </Link>
          </header>

          <main className="max-w-md w-full mx-auto my-auto space-y-12 py-12 lg:py-0">
            <div className="space-y-10">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <Briefcase className="w-4 h-4" />
                  <p className="label-mono font-bold">Partner Portal</p>
                </div>
                <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.05]">
                  Manage your shop.<br />
                  <span className="text-muted-foreground/40 font-medium">Grow your sales.</span>
                </h1>
              </div>

              <div className="space-y-6">
                {user && shops.length > 0 ? (
                  <div className="p-5 rounded-3xl bg-card border border-border space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                        <Store className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm">Signed in as {user.email}</div>
                        <div className="text-xs text-muted-foreground">Approved shop owner account</div>
                      </div>
                    </div>
                    <Link
                      href="/vendor"
                      className="w-full pill bg-foreground text-background font-bold py-3 px-4 flex items-center justify-center gap-2 text-sm"
                    >
                      Go to Vendor Dashboard <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ) : lastAccount ? (
                  <>
                    <GoogleSignInButton
                      callbackNextPath="/vendor"
                      mode="login"
                      loginHint={lastAccount.email}
                      label={`Continue as ${lastAccount.name || lastAccount.email}`}
                    />
                    <GoogleSignInButton
                      callbackNextPath="/vendor"
                      mode="login"
                      variant="subtle"
                      label="Use another account"
                    />
                  </>
                ) : (
                  <GoogleSignInButton callbackNextPath="/vendor" mode="login" />
                )}

                <div className="pt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span>Only approved shop owners can access the vendor dashboard.</span>
                </div>
              </div>
            </div>
          </main>

          <footer className="flex justify-end items-center text-[10px] text-muted-foreground/40 mt-auto pt-8">
            <Link href="/auth" className="hover:text-foreground transition-colors uppercase tracking-widest font-medium">Customer Login</Link>
          </footer>
        </motion.div>

        {/* Image Block - Professional Kitchen Visual */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="hidden lg:flex flex-1 relative p-6 bg-secondary/30 dark:bg-black/50 overflow-hidden"
        >
          <div className="relative w-full h-full overflow-hidden rounded-[2.5rem] border border-border group">
            <Image
              src="/images/vendor-hero.png"
              alt="Professional Kitchen"
              fill
              className="object-cover"
              priority
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-black/45" />
            
            {/* Removed Floating Achievement/Status Card per user request */}

            <div className="absolute bottom-16 left-16 right-16 text-white space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <h2 className="text-6xl font-bold tracking-tight mb-4 leading-[1.1]">
                  Efficiency in every order.
                </h2>
                <p className="text-xl text-white/80 max-w-md leading-relaxed font-medium">
                  We empower local vendors with the tools to handle peak campus rush hours with zero friction.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
