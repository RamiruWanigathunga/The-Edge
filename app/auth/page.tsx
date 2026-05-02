"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight, User, Sparkles, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const router = useRouter();

  const toggleMode = () => {
    setMode(prev => (prev === "login" ? "signup" : "login"));
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    // Frontend-only simulation for now
    localStorage.setItem("edge-onboarded", "true");
    localStorage.setItem("edge-user-name", name || "User");
    localStorage.setItem("edge-user-email", email || "user@example.com");
    
    // Set cookie for server-side proxy
    document.cookie = "edge-onboarded=true; path=/; max-age=31536000";
    
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row overflow-hidden selection:bg-primary selection:text-primary-foreground">
      {/* 
        Container that handles the layout swap.
        The layout transition is preserved as it's the primary "move" effect.
      */}
      <div 
        className={`flex-1 flex flex-col lg:flex-row w-full h-full min-h-screen ${
          mode === "signup" ? "lg:flex-row-reverse" : "lg:flex-row"
        }`}
      >
        
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
              THE EDGE
            </Link>
          </header>

          <main className="max-w-md w-full mx-auto my-auto space-y-12 py-12 lg:py-0">
            {/* Removed AnimatePresence for lighter performance */}
            <div className="space-y-10">
              <div className="space-y-4">
                <p className="label-mono text-primary font-bold">
                  {mode === "login" ? "Sign In" : "Get Started"}
                </p>
                <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.05]">
                  {mode === "login" ? (
                    <>Skip the line.<br /><span className="text-muted-foreground/40">Order ahead.</span></>
                  ) : (
                    <>Join the list.<br /><span className="text-muted-foreground/40">Eat better.</span></>
                  )}
                </h1>
                <p className="text-muted-foreground text-lg max-w-sm leading-relaxed">
                  {mode === "login" 
                    ? "Enter your email — we'll send a magic link. No passwords, ever."
                    : "Create your account to save your favorites and order faster across campus."
                  }
                </p>
              </div>

              <div className="space-y-5">
                <div className="space-y-5">
                  {mode === "signup" && (
                    <div className="space-y-2">
                      <label htmlFor="name" className="label-mono block text-[10px]">Full Name</label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                          id="name"
                          type="text"
                          placeholder="Your Name"
                          className="w-full h-14 pl-12 pr-4 rounded-2xl bg-secondary/50 dark:bg-white/5 border border-transparent focus:border-primary/20 focus:bg-background transition-all text-lg outline-none"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label htmlFor="email" className="label-mono block text-[10px]">Campus Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <input
                        id="email"
                        type="email"
                        placeholder="you@university.edu"
                        className="w-full h-14 pl-12 pr-4 rounded-2xl bg-secondary/50 dark:bg-white/5 border border-transparent focus:border-primary/20 focus:bg-background transition-all text-lg outline-none"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleAuth}
                  className="w-full h-14 mt-4 bg-foreground text-background font-bold rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-[0.98] transform group shadow-xl shadow-foreground/5 overflow-hidden relative"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {mode === "login" ? "Send magic link" : "Create account"}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                </button>

                <div className="pt-2 flex flex-col items-center gap-4">
                  <button 
                    onClick={toggleMode}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
                  >
                    {mode === "login" ? (
                      <>New here? <span className="text-foreground font-bold border-b-2 border-primary/40 hover:border-primary transition-colors ml-1">Create an account</span></>
                    ) : (
                      <>Already have an account? <span className="text-foreground font-bold border-b-2 border-primary/40 hover:border-primary transition-colors ml-1">Sign in</span></>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/30 dark:bg-white/5 text-[11px] text-muted-foreground leading-snug">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                <p>
                  By continuing, you agree to THE EDGE's{" "}
                  <Link href="/terms" className="underline hover:text-foreground font-medium">Terms</Link> and{" "}
                  <Link href="/privacy" className="underline hover:text-foreground font-medium">Privacy Policy</Link>.
                </p>
              </div>
            </div>
          </main>

          <footer className="flex justify-between items-center text-[10px] text-muted-foreground/40 mt-auto pt-8">
            <p>© 2026 THE EDGE · All rights reserved</p>
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
                  {mode === "login" ? "Your campus, served faster." : "The better way to dine."}
                </h2>
                <p className="text-xl text-white/80 max-w-md drop-shadow-lg leading-relaxed font-medium">
                  {mode === "login" 
                    ? "Order from every shop on campus. Pay once. Pick up when it's ready — no more queues."
                    : "Save your favorite meals, track your budget, and get exclusive campus-only offers."
                  }
                </p>
              </div>
              
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
