"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Power, Store } from "lucide-react";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { useMyApprovedShops, useSupabaseUser } from "@/lib/supabase/hooks";
import { useSignOut } from "@/lib/supabase/useSignOut";

export default function VendorHomePage() {
  const router = useRouter();
  const { data: user, isLoading: userLoading } = useSupabaseUser();
  const { data: shops = [], isLoading: shopsLoading } = useMyApprovedShops(user?.id);
  const { signOut, isSigningOut } = useSignOut("/vendor/login");

  useEffect(() => {
    if (!shopsLoading && shops.length === 1) {
      router.replace(`/vendor/${shops[0].slug}`);
    }
  }, [router, shops, shopsLoading]);

  if (userLoading || shopsLoading) {
    return (
      <div className="flex-1 grid place-items-center bg-background">
        <div className="w-10 h-10 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 bg-background grid place-items-center px-4">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 sm:p-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 grid place-items-center mb-5">
            <Lock className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Vendor sign in</h1>
          <p className="text-muted-foreground mt-3 leading-relaxed">
            Use the Google account that was approved for your shop.
          </p>
          <div className="mt-7">
            <GoogleSignInButton callbackNextPath="/vendor" />
          </div>
        </div>
      </div>
    );
  }

  if (shops.length === 0) {
    return (
      <div className="flex-1 bg-background grid place-items-center px-4">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 sm:p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-secondary grid place-items-center mx-auto mb-5">
            <Store className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">No approved shop yet</h1>
          <p className="text-muted-foreground mt-3 leading-relaxed">
            This Google account does not own an approved shop. Submit a request or wait for admin approval.
          </p>
          <div className="mt-7 flex flex-col gap-3">
            <Link href="/shop-registration" className="pill bg-foreground text-background px-5 py-3">
              Register a shop
            </Link>
            <button
              onClick={signOut}
              disabled={isSigningOut}
              className="pill border border-destructive/20 px-5 py-3 text-destructive disabled:opacity-50"
            >
              {isSigningOut ? "Signing out..." : "Sign out"}
            </button>
            <Link href="/" className="pill border border-border px-5 py-3">
              Back home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background px-4 py-20">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Choose a shop</h1>
          <button
            onClick={signOut}
            disabled={isSigningOut}
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-destructive disabled:opacity-50"
          >
            <Power className="w-4 h-4" />
            {isSigningOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
        <div className="mt-6 space-y-3">
          {shops.map((shop) => (
            <Link
              key={shop.id}
              href={`/vendor/${shop.slug}`}
              className="flex items-center justify-between rounded-3xl border border-border bg-card p-5 hover:bg-secondary transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-secondary grid place-items-center text-2xl">
                  {shop.emoji}
                </div>
                <div>
                  <div className="font-bold">{shop.name}</div>
                  <div className="text-sm text-muted-foreground">/{shop.slug}</div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
