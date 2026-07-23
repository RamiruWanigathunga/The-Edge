"use client";

import * as React from "react";
import {
  Bell, LogOut, ChevronRight, Moon, Sun, Pencil, CreditCard,
  HelpCircle, Check,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { QuickThemeToggle } from "@/components/ui/QuickThemeToggle";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";
import { useSupabaseUser, useProfile, useUserOrders } from "@/lib/supabase/hooks";
import { updateProfile } from "@/lib/supabase/data";
import { useSignOut } from "@/lib/supabase/useSignOut";
import { DeleteAccountButton } from "@/components/auth/DeleteAccountButton";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/Skeleton";

import { Footer } from "@/components/layout/Footer";

export default function ProfilePage() {
  const [mounted, setMounted] = React.useState(false);
  const { data: user } = useSupabaseUser();
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useProfile(user?.id);
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

  return (
    <div className="flex-1 bg-background flex flex-col">
      <main className="container mx-auto px-4 py-8 md:pt-28 md:py-12 pb-24 flex-1">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8 lg:gap-12">
          
          {/* ── LEFT COLUMN (Profile Info) ── */}
          <aside className="w-full md:w-80 shrink-0">
            <div className="bg-white dark:bg-card shadow-soft rounded-[2.5rem] p-8 sticky top-24 overflow-hidden">
              <div className="flex flex-col items-center text-center relative z-10">
                <div className="relative mb-6 group">
                  <div className="w-32 h-32 overflow-hidden flex items-center justify-center">
                    <ProfileAvatar className="w-full h-full" iconSize={64} />
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
                  ) : profileLoading ? (
                    <Skeleton className="h-7 w-32" />
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
                <p className="text-muted-foreground text-sm font-medium">{user?.email}</p>
                {profileLoading ? (
                  <Skeleton className="h-3 w-24 mt-2 mb-8" />
                ) : (
                  <p className="text-muted-foreground/70 text-[11px] font-medium mt-1 mb-8">
                    {profile?.createdAt
                      ? `Member since ${new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}`
                      : " "}
                  </p>
                )}

                <div className="w-full grid grid-cols-2 gap-4 border-y border-border py-6 mb-8">
                  <div className="space-y-1">
                    {profileLoading ? (
                      <Skeleton className="h-6 w-8" />
                    ) : (
                      <div className="text-xl font-bold">{profile?.totalOrders || 0}</div>
                    )}
                    <div className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground">Orders</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xl font-bold">{orders.length}</div>
                    <div className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground">Active</div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* ── RIGHT COLUMN (Settings) ── */}
          <div className="flex-1 space-y-8">
            <section>
              <h3 className="label-mono mb-4 ml-2">Appearance</h3>
              <div className="hidden md:flex bg-white dark:bg-card shadow-soft rounded-3xl overflow-hidden p-5 items-center justify-between">
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
              <div className="md:hidden bg-white dark:bg-card shadow-soft rounded-3xl overflow-hidden p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-secondary/80 flex items-center justify-center">
                    <Sun className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="font-bold text-[16px]">Quick Toggle</div>
                    <div className="text-[12px] text-muted-foreground font-medium">Switch light/dark instantly</div>
                  </div>
                </div>
                <QuickThemeToggle />
              </div>
            </section>

            <section>
              <h3 className="label-mono mb-4 ml-2">Preferences</h3>
              <div className="bg-white dark:bg-card shadow-soft rounded-[2.5rem] overflow-hidden">
                {[
                  { icon: Bell, label: "Notifications", sub: "Control your alerts" },
                  { icon: CreditCard, label: "Payment Methods", sub: "Manage your cards" },
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
              className="w-full flex items-center justify-center gap-2 py-3 text-sm text-destructive font-bold hover:bg-destructive/5 rounded-[2.5rem] transition-smooth border border-transparent hover:border-destructive/10"
            >
              <LogOut className="w-5 h-5" />
              {isSigningOut ? "Signing Out..." : "Sign Out"}
            </button>

            <DeleteAccountButton redirectTo="/auth" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
