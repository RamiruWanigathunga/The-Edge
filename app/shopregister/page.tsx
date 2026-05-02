"use client";

import { useState } from "react";
import { ArrowLeft, Store, CheckCircle2, Upload } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { toast } from "sonner";

const shopCategories = ["Rice & Meals", "Snacks", "Beverages", "Desserts", "Coffee", "Juice", "Bakery", "Other"];

export default function ShopRegisterPage() {
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

  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "shopName" && typeof value === "string") {
      setForm((prev) => ({
        ...prev,
        shopName: value,
        slug: value.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, ""),
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.agreeTerms) {
      toast.error("Please agree to the terms to proceed.");
      return;
    }
    // TODO: Replace with Supabase mutation — INSERT INTO shop_registrations (status: 'pending')
    setSubmitted(true);
    toast.success("Registration submitted! Pending review.");
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-20 md:pt-36 max-w-lg text-center">
          <div className="w-20 h-20 rounded-full bg-success-soft grid place-items-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-success-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-3">Application received!</h1>
          <p className="text-muted-foreground leading-relaxed">
            Your shop registration for <strong>{form.shopName}</strong> has been submitted. Our team will manually review your application and approve it in Supabase.
          </p>
          <div className="mt-8 rounded-3xl border border-border bg-card p-6 text-left space-y-3">
            <div className="label-mono mb-2">What happens next</div>
            {[
              "Our team reviews your application (1–2 business days)",
              "We verify your payment link and shop details",
              "You receive an email with your vendor dashboard access",
              "Your shop goes live on THE EDGE",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <div className="w-6 h-6 rounded-full bg-secondary grid place-items-center text-xs font-semibold shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <span className="text-muted-foreground">{step}</span>
              </div>
            ))}
          </div>
          <Link
            href="/"
            className="mt-8 inline-flex pill bg-foreground text-background px-8 py-3 font-medium hover:bg-foreground/90 transition-smooth"
          >
            Back to home
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:pt-28 max-w-2xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground focus-dashed transition-smooth mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <div className="label-mono mb-2">● Register</div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">List your shop</h1>
        <p className="text-muted-foreground mt-2">
          Reach hundreds of students daily. Manual approval ensures quality on campus.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* Shop info */}
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
                placeholder="e.g. Rocky Sweats"
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
                  onChange={(e) => handleChange("slug", e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ""))}
                  placeholder="rocksweats"
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
                <option value="">Select a category…</option>
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
                placeholder="Describe your shop, specialties, and what makes you unique…"
                rows={3}
                className="w-full px-4 py-3 rounded-2xl bg-secondary border border-transparent focus:border-primary focus:bg-background outline-none text-sm transition-smooth focus-dashed resize-none placeholder:text-muted-foreground"
              />
            </div>

            {/* Logo / banner upload placeholders */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label-mono mb-2 block">Shop logo</label>
                <div className="rounded-2xl border-2 border-dashed border-border p-6 grid place-items-center text-center text-muted-foreground hover:border-primary hover:text-primary transition-smooth cursor-pointer">
                  <Upload className="w-6 h-6 mb-2" />
                  <span className="text-xs">Upload logo</span>
                  <span className="text-[10px] mt-1">PNG, JPG up to 2MB</span>
                  {/* TODO: Replace with file upload to Supabase Storage */}
                </div>
              </div>
              <div>
                <label className="label-mono mb-2 block">Banner image</label>
                <div className="rounded-2xl border-2 border-dashed border-border p-6 grid place-items-center text-center text-muted-foreground hover:border-primary hover:text-primary transition-smooth cursor-pointer">
                  <Upload className="w-6 h-6 mb-2" />
                  <span className="text-xs">Upload banner</span>
                  <span className="text-[10px] mt-1">1200×400px recommended</span>
                  {/* TODO: Replace with file upload to Supabase Storage */}
                </div>
              </div>
            </div>
          </section>

          {/* Owner info */}
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
              <label className="label-mono mb-2 block" htmlFor="paymentLink">
                Payment link
              </label>
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
                Students will be redirected to this link when checking out from your shop.
              </p>
            </div>
          </section>

          {/* Agreement */}
          <div className="flex items-start gap-3">
            <input
              id="agreeTerms"
              type="checkbox"
              checked={form.agreeTerms}
              onChange={(e) => handleChange("agreeTerms", e.target.checked)}
              className="mt-1 w-4 h-4 accent-primary"
            />
            <label htmlFor="agreeTerms" className="text-sm text-muted-foreground leading-relaxed">
              I confirm that all information provided is accurate. I understand my shop requires manual approval by THE EDGE team before going live.
            </label>
          </div>

          <button
            id="submit-registration"
            type="submit"
            className="w-full pill bg-foreground text-background py-4 font-semibold hover:bg-foreground/90 transition-smooth focus-dashed shadow-pop"
          >
            Submit for review
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
}
