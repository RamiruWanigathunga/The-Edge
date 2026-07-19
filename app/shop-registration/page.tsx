"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Lock, Store, Upload } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Footer } from "@/components/layout/Footer";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { useShopRegistrationEnabled, useSupabaseUser } from "@/lib/supabase/hooks";
import { submitShopRegistration } from "@/lib/supabase/data";

const shopCategories = ["Rice & Meals", "Snacks", "Beverages", "Desserts", "Coffee", "Juice", "Bakery", "Other"];

function slugify(value: string) {
  return value.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "");
}

export default function ShopRegistrationPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    shopName: "",
    slug: "",
    ownerName: "",
    email: "",
    paymentLink: "",
    description: "",
    category: "",
    agreeTerms: false,
  });

  const { data: user, isLoading: userLoading } = useSupabaseUser();
  const { data: registrationEnabled, isLoading: settingsLoading } = useShopRegistrationEnabled();

  const registrationMutation = useMutation({
    mutationFn: (params: Parameters<typeof submitShopRegistration>[0]) => submitShopRegistration(params),
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Registration submitted. Pending review.");
    },
    onError: (error: any) => {
      const message = error?.message || "Failed to submit registration";
      if (message.toLowerCase().includes("duplicate")) {
        toast.error("You already have a pending request, or this shop URL is taken.");
      } else {
        toast.error(message);
      }
    },
  });

  useEffect(() => {
    if (!user) return;

    setForm((prev) => ({
      ...prev,
      ownerName: prev.ownerName || user.user_metadata?.full_name || user.user_metadata?.name || "",
      email: prev.email || user.email || "",
    }));
  }, [user]);

  const handleChange = (field: string, value: string | boolean) => {
    if (field === "shopName" && typeof value === "string") {
      setForm((prev) => ({ ...prev, shopName: value, slug: slugify(value) }));
      return;
    }

    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please sign in with Google before submitting.");
      return;
    }

    if (!registrationEnabled) {
      toast.error("Shop registration is currently closed.");
      return;
    }

    if (!form.agreeTerms) {
      toast.error("Please agree to the terms to proceed.");
      return;
    }

    registrationMutation.mutate({
      userId: user.id,
      shopName: form.shopName.trim(),
      slug: form.slug.trim(),
      ownerName: form.ownerName.trim(),
      email: form.email.trim(),
      paymentLink: form.paymentLink.trim(),
      description: form.description.trim(),
      category: form.category,
    });
  };

  const isSubmitting = registrationMutation.isPending;

  if (userLoading || settingsLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="w-10 h-10 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-20 md:pt-36 max-w-lg">
          <Link href="/profile" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to profile
          </Link>
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-soft">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 grid place-items-center mb-5">
              <Lock className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Sign in to register</h1>
            <p className="text-muted-foreground mt-3 leading-relaxed">
              Vendors must use a Google account before requesting a shop. This lets admins approve the correct owner.
            </p>
            <div className="mt-7">
              <GoogleSignInButton callbackNextPath="/shop-registration" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (registrationEnabled === false) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-20 md:pt-36 max-w-lg text-center">
          <div className="w-20 h-20 rounded-full bg-secondary grid place-items-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-3">Shop registration is closed</h1>
          <p className="text-muted-foreground leading-relaxed">
            The Edge team is not accepting new shop requests right now. Existing approved vendors can still sell normally.
          </p>
          <Link href="/profile" className="pill bg-foreground text-background px-5 py-3 inline-flex mt-8">
            Back to profile
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-20 md:pt-36 max-w-lg text-center">
          <div className="w-20 h-20 rounded-full bg-success-soft grid place-items-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-success-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-3">Application received</h1>
          <p className="text-muted-foreground leading-relaxed">
            Your shop registration for <strong>{form.shopName}</strong> is pending manual admin approval.
          </p>
          <div className="mt-8 rounded-3xl border border-border bg-card p-6 text-left space-y-3">
            <div className="label-mono mb-2">What happens next</div>
            {[
              "Admins review the request in Supabase",
              "The payment link and shop details are checked",
              "Approval creates your vendor shop",
              "You sign in with Google at the vendor portal",
            ].map((step, i) => (
              <div key={step} className="flex items-start gap-3 text-sm">
                <div className="w-6 h-6 rounded-full bg-secondary grid place-items-center text-xs font-semibold shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <span className="text-muted-foreground">{step}</span>
              </div>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:pt-28 max-w-2xl">
        <Link href="/profile" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to profile
        </Link>
        <div className="label-mono mb-2">Register</div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">List your shop</h1>
        <p className="text-muted-foreground mt-2">
          Submit your details for manual approval. Only approved shops can sell on The Edge.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <section className="rounded-3xl border border-border bg-card p-6 space-y-5">
            <h2 className="font-semibold tracking-tight flex items-center gap-2">
              <Store className="w-4 h-4 text-primary" /> Shop information
            </h2>

            <div>
              <label className="label-mono mb-2 block" htmlFor="shopName">Shop name</label>
              <input
                id="shopName"
                required
                value={form.shopName}
                onChange={(e) => handleChange("shopName", e.target.value)}
                placeholder="e.g. Rocky Sweets"
                className="w-full px-4 py-3 rounded-2xl bg-secondary border border-transparent focus:border-primary focus:bg-background outline-none text-sm transition-smooth focus-dashed placeholder:text-muted-foreground"
              />
            </div>

            <div>
              <label className="label-mono mb-2 block" htmlFor="slug">Shop URL slug</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">theedge.com/shop/</span>
                <input
                  id="slug"
                  required
                  value={form.slug}
                  onChange={(e) => handleChange("slug", slugify(e.target.value))}
                  placeholder="rockysweets"
                  className="flex-1 px-4 py-3 rounded-2xl bg-secondary border border-transparent focus:border-primary focus:bg-background outline-none text-sm transition-smooth focus-dashed font-mono placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div>
              <label className="label-mono mb-2 block" htmlFor="category">Primary category</label>
              <select
                id="category"
                required
                value={form.category}
                onChange={(e) => handleChange("category", e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-secondary border border-transparent focus:border-primary focus:bg-background outline-none text-sm transition-smooth focus-dashed"
              >
                <option value="">Select a category...</option>
                {shopCategories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label-mono mb-2 block" htmlFor="description">Shop description</label>
              <textarea
                id="description"
                required
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Describe your shop, specialties, and what makes you unique..."
                rows={3}
                className="w-full px-4 py-3 rounded-2xl bg-secondary border border-transparent focus:border-primary focus:bg-background outline-none text-sm transition-smooth focus-dashed resize-none placeholder:text-muted-foreground"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label-mono mb-2 block">Shop logo</label>
                <div className="rounded-2xl border-2 border-dashed border-border p-6 grid place-items-center text-center text-muted-foreground">
                  <Upload className="w-6 h-6 mb-2" />
                  <span className="text-xs">Admin uploads after approval</span>
                </div>
              </div>
              <div>
                <label className="label-mono mb-2 block">Banner image</label>
                <div className="rounded-2xl border-2 border-dashed border-border p-6 grid place-items-center text-center text-muted-foreground">
                  <Upload className="w-6 h-6 mb-2" />
                  <span className="text-xs">Admin uploads after approval</span>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-card p-6 space-y-5">
            <h2 className="font-semibold tracking-tight">Owner information</h2>
            <div>
              <label className="label-mono mb-2 block" htmlFor="ownerName">Full name</label>
              <input
                id="ownerName"
                required
                value={form.ownerName}
                onChange={(e) => handleChange("ownerName", e.target.value)}
                placeholder="Your full name"
                className="w-full px-4 py-3 rounded-2xl bg-secondary border border-transparent focus:border-primary focus:bg-background outline-none text-sm transition-smooth focus-dashed placeholder:text-muted-foreground"
              />
            </div>
            <div>
              <label className="label-mono mb-2 block" htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-2xl bg-secondary border border-transparent focus:border-primary focus:bg-background outline-none text-sm transition-smooth focus-dashed placeholder:text-muted-foreground"
              />
            </div>
            <div>
              <label className="label-mono mb-2 block" htmlFor="paymentLink">Payment link</label>
              <input
                id="paymentLink"
                type="url"
                required
                value={form.paymentLink}
                onChange={(e) => handleChange("paymentLink", e.target.value)}
                placeholder="https://pay.example.com/your-shop"
                className="w-full px-4 py-3 rounded-2xl bg-secondary border border-transparent focus:border-primary focus:bg-background outline-none text-sm transition-smooth focus-dashed font-mono placeholder:text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Students use this link when checking out from your approved shop.
              </p>
            </div>
          </section>

          <div className="flex items-start gap-3">
            <input
              id="agreeTerms"
              type="checkbox"
              checked={form.agreeTerms}
              onChange={(e) => handleChange("agreeTerms", e.target.checked)}
              className="mt-1 w-4 h-4 accent-primary"
            />
            <label htmlFor="agreeTerms" className="text-sm text-muted-foreground leading-relaxed">
              I confirm that all information is accurate and understand that the shop requires manual approval before going live.
            </label>
          </div>

          <button
            id="submit-registration"
            type="submit"
            disabled={isSubmitting}
            className="w-full pill bg-foreground text-background py-4 font-semibold hover:bg-foreground/90 transition-smooth focus-dashed shadow-pop flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                Submitting...
              </>
            ) : "Submit for review"}
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
}
