"use client";

import * as React from "react";
import Link from "next/link";
import { 
  Bell, Shield, LogOut, ChevronRight, Moon, Sun, 
  BadgeCheck, Pencil, CreditCard, Heart, 
  HelpCircle, MessageSquare, FileText, ExternalLink, Check
} from "lucide-react";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";
import { useProfile } from "@/store/profile";

export default function ProfilePage() {
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const { name, setName, email } = useProfile();
  const [tempName, setTempName] = React.useState("");
  const [isEditingName, setIsEditingName] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (mounted) {
      setTempName(name);
    }
  }, [mounted, name]);

  React.useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditingName]);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const stats = [
    { label: "Orders", value: "24" },
    { label: "Favorites", value: "12" },
    { label: "Points", value: "850" },
  ];

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-background">
      <main className="container mx-auto px-4 py-8 md:pt-28 md:py-12 pb-24">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8 lg:gap-12">
          
          {/* ── LEFT COLUMN (Profile Info) ── */}
          <aside className="w-full md:w-80 shrink-0">
            <div className="bg-white dark:bg-card border border-border rounded-[2.5rem] p-8 shadow-soft sticky top-24">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-background shadow-elevated">
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
                      onChange={(e) => {
                        if (e.target.value.length <= 20) {
                          setTempName(e.target.value);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && tempName.trim().length > 0) {
                          if (name !== tempName.trim()) {
                            setName(tempName.trim());
                          }
                          setIsEditingName(false);
                        } else if (e.key === "Escape") {
                          setTempName(name);
                          setIsEditingName(false);
                        }
                      }}
                      onBlur={() => {
                        if (tempName.trim().length > 0) {
                          if (name !== tempName.trim()) {
                            setName(tempName.trim());
                          }
                        }
                        setIsEditingName(false);
                      }}
                      className="text-2xl font-bold tracking-tight bg-transparent border-b border-primary outline-none text-center min-w-0 max-w-[220px] text-foreground"
                    />
                  ) : (
                    <h2 className="text-2xl font-bold tracking-tight text-center truncate">{name}</h2>
                  )}
                  <div className="w-8 shrink-0 flex justify-start pl-2">
                    <button 
                      onMouseDown={(e) => {
                        // Prevent blur from firing before this click
                        e.preventDefault(); 
                      }}
                      onClick={() => {
                        if (isEditingName) {
                          if (tempName.trim().length > 0) {
                            if (name !== tempName.trim()) {
                              setName(tempName.trim());
                            }
                            setIsEditingName(false);
                          }
                        } else {
                          setTempName(name);
                          setIsEditingName(true);
                        }
                      }}
                      disabled={isEditingName && tempName.trim().length === 0}
                      className="text-muted-foreground hover:text-primary transition-smooth focus-dashed rounded-md p-1 disabled:opacity-50 disabled:cursor-not-allowed" 
                      aria-label="Edit Name"
                    >
                      {isEditingName ? <Check className="w-5 h-5 text-success" /> : <Pencil className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm font-medium mb-8">{email}</p>

                <div className="w-full grid grid-cols-3 gap-4 border-y border-border py-6 mb-8">
                  {stats.map((stat) => (
                    <div key={stat.label} className="space-y-1">
                      <div className="text-xl font-bold">{stat.value}</div>
                      <div className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
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
              <div className="bg-white dark:bg-card border border-border rounded-3xl overflow-hidden shadow-soft">
                <div className="flex items-center justify-between p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-secondary/80 flex items-center justify-center">
                      <Moon className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="font-bold text-[16px]">Dark Mode</div>
                      <div className="text-[12px] text-muted-foreground font-medium">Simplify your night viewing</div>
                    </div>
                  </div>
                  <ThemeToggle />
                </div>
              </div>
            </section>

            {/* Account Settings */}
            <section>
              <h3 className="label-mono mb-4 ml-2">Preferences</h3>
              <div className="bg-white dark:bg-card border border-border rounded-[2rem] overflow-hidden shadow-soft">
                {[
                  { icon: Bell, label: "Notifications", sub: "Control your alerts" },
                  { icon: CreditCard, label: "Payment Methods", sub: "Manage your cards" },
                  { icon: MessageSquare, label: "Give Feedback", sub: "Help us improve" },
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

            {/* Legal & Security */}
            <section>
              <h3 className="label-mono mb-4 ml-2">Security & Legal</h3>
              <div className="bg-white dark:bg-card border border-border rounded-[2rem] overflow-hidden shadow-soft">
                {[
                  { icon: Shield, label: "Privacy & Security", sub: "Data and login protection" },
                  { icon: FileText, label: "Terms and Conditions", sub: "Our legal policies", href: "/terms" },
                ].map((item, idx, arr) => (
                  item.href ? (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`flex items-center justify-between p-5 hover:bg-secondary/50 transition-smooth ${
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
                      <ExternalLink className="w-5 h-5 text-muted-foreground/30" />
                    </Link>
                  ) : (
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
                  )
                ))}
              </div>
            </section>

            <button className="w-full flex items-center justify-center gap-2 py-5 text-destructive font-bold hover:bg-destructive/5 rounded-[2rem] transition-smooth border border-transparent hover:border-destructive/10">
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
