"use client";

import * as React from "react";
import Link from "next/link";
import { 
  Bell, Shield, LogOut, ChevronRight, Moon, Sun, 
  BadgeCheck, Pencil, CreditCard, Heart, 
  HelpCircle, MessageSquare, FileText, ExternalLink, Check,
  Trophy, Star, Crown, Zap, Medal
} from "lucide-react";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";
import { useSupabaseUser, useProfile, useUserOrders } from "@/lib/supabase/hooks";
import { updateProfile } from "@/lib/supabase/data";
import { useSignOut } from "@/lib/supabase/useSignOut";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const [mounted, setMounted] = React.useState(false);
  const { data: user } = useSupabaseUser();
  const { data: profile, refetch: refetchProfile } = useProfile(user?.id);
  const { data: orders = [] } = useUserOrders(user?.id);
  const { signOut, isSigningOut } = useSignOut("/auth");
  
  const [tempName, setTempName] = React.useState("");
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [isSavingName, setIsSavingName] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (profile?.displayName) {
      setTempName(profile.displayName);
    }
  }, [profile]);

  React.useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditingName]);

  const handleUpdateName = async () => {
    if (!user || !tempName.trim()) return;
    setIsSavingName(true);
    try {
      await updateProfile(user.id, { display_name: tempName.trim() });
      await refetchProfile();
      setIsEditingName(false);
      toast.success("Name updated");
    } catch (e) {
      toast.error("Failed to update name");
    } finally {
      setIsSavingName(false);
    }
  };

  if (!mounted) return null;

  // Tier Logic
  const tiers = {
    bronze: { label: "Bronze", badge: Medal, color: "text-orange-400", next: 10, bg: "bg-orange-400/10" },
    silver: { label: "Silver", badge: Star, color: "text-slate-400", next: 25, bg: "bg-slate-400/10" },
    gold: { label: "Gold", badge: Trophy, color: "text-yellow-400", next: 50, bg: "bg-yellow-400/10" },
    platinum: { label: "Platinum", badge: Zap, color: "text-cyan-400", next: 100, bg: "bg-cyan-400/10" },
    diamond: { label: "Diamond", badge: Crown, color: "text-purple-400", next: 1000, bg: "bg-purple-400/10" },
  };

  const currentTier = (profile?.tier?.toLowerCase() as keyof typeof tiers) || "bronze";
  const tierInfo = tiers[currentTier];
  const progress = Math.min(100, ((profile?.totalOrders || 0) / tierInfo.next) * 100);

  return (
    <div className="flex-1 bg-[#F8F9FA] dark:bg-background">
      <main className="container mx-auto px-4 py-8 md:pt-28 md:py-12 pb-24">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8 lg:gap-12">
          
          {/* ── LEFT COLUMN (Profile Info) ── */}
          <aside className="w-full md:w-80 shrink-0">
            <div className="bg-white dark:bg-card border border-border rounded-[2.5rem] p-8 shadow-soft sticky top-24 overflow-hidden">
              {/* Tier Background Glow */}
              <div className={`absolute -top-12 -right-12 w-32 h-32 blur-3xl opacity-20 rounded-full ${tierInfo.bg}`} />
              
              <div className="flex flex-col items-center text-center relative z-10">
                <div className="relative mb-6 group">
                  <div className="w-32 h-32 overflow-hidden flex items-center justify-center">
                    <ProfileAvatar className="w-full h-full" iconSize={64} />
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-white dark:bg-card border border-border flex items-center justify-center shadow-md ${tierInfo.color}`}>
                    <tierInfo.badge className="w-5 h-5" />
                  </div>
                </div>

                <div className="flex items-center justify-center w-full mb-1">
                  <div className="w-8 shrink-0" />
                  {isEditingName ? (
                    <input
                      ref={inputRef}
                      value={tempName}
                      maxLength={20}
                      onChange={(e) => setTempName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleUpdateName();
                        if (e.key === "Escape") {
                          setTempName(profile?.displayName || "");
                          setIsEditingName(false);
                        }
                      }}
                      onBlur={handleUpdateName}
                      className="text-2xl font-bold tracking-tight bg-transparent border-b border-primary outline-none text-center min-w-0 max-w-[220px] text-foreground"
                    />
                  ) : (
                    <h2 className="text-2xl font-bold tracking-tight text-center truncate">
                      {profile?.displayName || user?.email?.split('@')[0] || "Guest"}
                    </h2>
                  )}
                  <div className="w-8 shrink-0 flex justify-start pl-2">
                    <button 
                      onClick={() => setIsEditingName(true)}
                      className="text-muted-foreground hover:text-primary transition-smooth"
                    >
                      {isSavingName ? (
                        <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      ) : isEditingName ? (
                        <Check className="w-5 h-5 text-success" />
                      ) : (
                        <Pencil className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm font-medium mb-8">{user?.email}</p>

                {/* Tier Progress */}
                <div className="w-full mb-8 text-left">
                  <div className="flex justify-between items-end mb-2">
                    <div className={`text-[10px] font-black uppercase tracking-widest ${tierInfo.color}`}>{tierInfo.label} Member</div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase">{profile?.totalOrders || 0}/{tierInfo.next} Orders</div>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className={`h-full rounded-full ${tierInfo.bg.replace('/10', '')}`}
                    />
                  </div>
                  <p className="text-[9px] text-muted-foreground mt-2 font-medium">
                    {tierInfo.next - (profile?.totalOrders || 0)} more orders to unlock the next tier!
                  </p>
                </div>

                <div className="w-full grid grid-cols-2 gap-4 border-y border-border py-6 mb-8">
                  <div className="space-y-1">
                    <div className="text-xl font-bold">{profile?.totalOrders || 0}</div>
                    <div className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground">Orders</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xl font-bold">{orders.length}</div>
                    <div className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground">Active</div>
                  </div>
                </div>

                <Link
                  href="/favorites"
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-foreground text-background dark:bg-white dark:text-black rounded-2xl font-bold hover:opacity-90 transition-smooth shadow-pop"
                >
                  <Heart className="w-4 h-4 fill-current" />
                  View Favorites
                </Link>
              </div>
            </div>
          </aside>

          {/* ── RIGHT COLUMN (Settings) ── */}
          <div className="flex-1 space-y-8">
            <section>
              <h3 className="label-mono mb-4 ml-2">Appearance</h3>
              <div className="bg-white dark:bg-card border border-border rounded-3xl overflow-hidden shadow-soft p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-secondary/80 flex items-center justify-center">
                    <Moon className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="font-bold text-[16px]">Dark Mode</div>
                  
                  </div>
                </div>
                <ThemeToggle />
              </div>
            </section>

            <section>
              <h3 className="label-mono mb-4 ml-2">Preferences</h3>
              <div className="bg-white dark:bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-soft">
                {[
                  { icon: Bell, label: "Notifications", sub: "Control your alerts" },
                  { icon: CreditCard, label: "Payment Methods", sub: "Manage your cards" },
                  { icon: Shield, label: "Privacy & Security", sub: "Data protection" },
                  { icon: HelpCircle, label: "Help Center", sub: "FAQs and guides" },
                ].map((item, idx, arr) => (
                  <button 
                    key={item.label}
                    className={`w-full flex items-center justify-between p-5 hover:bg-secondary/50 transition-smooth text-left ${
                      idx !== arr.length - 1 ? "border-b border-border/50" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-secondary/80 flex items-center justify-center">
                        <item.icon className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-bold text-[16px]">{item.label}</div>
                        <div className="text-[12px] text-muted-foreground font-medium">{item.sub}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground/30" />
                  </button>
                ))}
              </div>
            </section>

            <button 
              onClick={signOut}
              disabled={isSigningOut}
              className="w-full flex items-center justify-center gap-2 py-5 text-destructive font-bold hover:bg-destructive/5 rounded-[2.5rem] transition-smooth border border-transparent hover:border-destructive/10"
            >
              <LogOut className="w-5 h-5" />
              {isSigningOut ? "Signing Out..." : "Sign Out"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
