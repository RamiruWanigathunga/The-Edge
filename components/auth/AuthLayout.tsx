"use client";

import { useEffect, useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, ShieldCheck, AlertCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

interface AuthLayoutProps {
  initialMode?: "login" | "signup";
}

export function AuthLayout({ initialMode: propMode }: AuthLayoutProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const error = searchParams.get("error");
  
  // Use propMode if provided, otherwise check searchParams, then fallback to path-based default
  const [authMode, setAuthMode] = useState<"login" | "signup">(
    propMode || 
    (searchParams.get("mode") as "login" | "signup") || 
    (pathname === "/login" ? "login" : "signup")
  );

  // Sync mode if prop changes
  useEffect(() => {
    if (propMode) setAuthMode(propMode);
  }, [propMode]);

  // Redirect if already logged in
  useEffect(() => {
    const checkSession = async () => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) return;
      const { data: { user: session } } = await supabase.auth.getUser();
      if (session) {
        router.replace("/browse");
      }
    };
    checkSession();
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row overflow-hidden selection:bg-primary selection:text-primary-foreground">
      <div className="flex-1 flex flex-col lg:flex-row w-full h-full min-h-screen">
        
        {/* Auth Block */}
        <motion.div 
          layout
          transition={{
            layout: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
          }}
          className="flex-1 flex flex-col justify-between p-8 md:p-16 lg:p-24 bg-background relative z-10"
        >
          <header className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold tracking-tighter hover:opacity-80 transition-opacity">
              The Edge
            </Link>
          </header>

          <main className="max-w-md w-full mx-auto my-auto space-y-12 py-12 lg:py-0">
            <div className="space-y-10">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="label-mono text-primary font-bold uppercase tracking-widest text-xs">
                    {authMode === "login" ? "Welcome Back" : "Join The Edge"}
                  </p>
                  
                  {/* Mode Toggle */}
                  <div className="flex bg-secondary/50 p-1 rounded-full border border-border/50">
                    <Link 
                      href="/login"
                      onClick={(e) => {
                        if (pathname === "/login") {
                          e.preventDefault();
                          setAuthMode("login");
                        }
                      }}
                      className={`px-4 py-1.5 rounded-full text-[11px] font-bold transition-all ${authMode === "login" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      Log In
                    </Link>
                    <Link 
                      href="/signup"
                      onClick={(e) => {
                        if (pathname === "/signup") {
                          e.preventDefault();
                          setAuthMode("signup");
                        }
                      }}
                      className={`px-4 py-1.5 rounded-full text-[11px] font-bold transition-all ${authMode === "signup" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      Sign Up
                    </Link>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={authMode}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.05]">
                      {authMode === "login" ? (
                        <>Skip the line.<br /><span className="text-muted-foreground/40">Order ahead.</span></>
                      ) : (
                        <>Taste the<br /><span className="text-muted-foreground/40">Campus.</span></>
                      )}
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-sm leading-relaxed">
                      {authMode === "login" 
                        ? "Log in to access your favorites and track your active pickups."
                        : "Create an account to start ordering from every shop on campus."}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="space-y-5">
                {error === "user-not-found" && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-start gap-3 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm"
                  >
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <div>
                      <p className="font-bold">Account not found</p>
                      <p className="opacity-80">We couldn&apos;t find an existing account for this email. Please <strong>Sign Up</strong> first to create one.</p>
                      <Link 
                        href="/signup"
                        className="mt-2 block text-xs font-bold underline hover:opacity-80"
                      >
                        Switch to Sign Up
                      </Link>
                    </div>
                  </motion.div>
                )}
                
                <GoogleSignInButton mode={authMode} />
                
                {authMode === "login" ? (
                  <p className="text-center text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link href="/signup" className="text-primary font-bold hover:underline">Sign up</Link>
                  </p>
                ) : (
                  <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" className="text-primary font-bold hover:underline">Log in</Link>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/30 dark:bg-white/5 text-[11px] text-muted-foreground leading-snug">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                <p>
                  By continuing, you agree to The Edge&apos;s{" "}
                  <Link href="/terms" className="underline hover:text-foreground font-medium">Terms</Link> and{" "}
                  <Link href="/privacy" className="underline hover:text-foreground font-medium">Privacy Policy</Link>.
                </p>
              </div>
            </div>
          </main>

          <footer className="flex justify-between items-center text-[10px] text-muted-foreground/40 mt-auto pt-8">
            <p>© 2026 The Edge · All rights reserved</p>
            <Link href="/vendor/login" className="hover:text-foreground transition-colors flex items-center gap-1 font-medium uppercase tracking-widest">
              Vendor sign in <ArrowRight className="w-3 h-3" />
            </Link>
          </footer>
        </motion.div>

        {/* Image Block - Hidden on mobile and tablet (lg breakpoint) */}
        <motion.div 
          layout
          transition={{
            layout: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
          }}
          className="hidden lg:flex flex-1 relative p-6 bg-secondary/50 dark:bg-black/50 overflow-hidden"
        >
          <div className="relative w-full h-full overflow-hidden rounded-[2.5rem] shadow-2xl group">
            <Image
              src="/images/auth-hero.png"
              alt="The Edge Campus Food"
              fill
              sizes="50vw"
              className="object-cover transition-transform duration-[20s] ease-linear group-hover:scale-110"
              priority
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            {/* Floating UI elements */}
            <div className="absolute top-8 left-8">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="glass-light px-4 py-2.5 rounded-full flex items-center gap-2 text-white text-sm font-semibold shadow-2xl backdrop-blur-md border border-white/20"
              >
                <Sparkles className="w-4 h-4 text-black animate-pulse" />
                <span>v2.0 coming soon</span>
              </motion.div>
            </div>

            <div className="absolute bottom-16 left-16 right-16 text-white space-y-4">
              <div className="space-y-4">
                <h2 className="text-6xl font-bold tracking-tight mb-4 drop-shadow-xl leading-[1.1]">
                  Your campus, served faster.
                </h2>
                <p className="text-xl text-white/80 max-w-md drop-shadow-lg leading-relaxed font-medium">
                  Order from every shop on campus. Pay once. Pick up when it&apos;s ready - no more queues.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
