"use client";

import { Footer } from "@/components/layout/Footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto max-w-3xl px-4 py-12 md:pt-28">
        <h1 className="mb-8 text-4xl font-bold tracking-tight">Privacy Policy</h1>

        <div className="prose prose-slate max-w-none space-y-8 text-muted-foreground dark:prose-invert">
          <section>
            <h2 className="mb-4 text-xl font-bold text-foreground">1. Information We Collect</h2>
            <p>
              The Edge stores only the information needed to provide campus food ordering,
              such as your email address, profile details, saved favorites, and order history.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-bold text-foreground">2. How We Use Your Data</h2>
            <p>
              We use your data to authenticate your account, place orders with vendors,
              improve the product experience, and support order tracking and fulfillment.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-bold text-foreground">3. Data Sharing</h2>
            <p>
              Order details are shared only with the relevant campus vendor to prepare and
              fulfill your order. We do not sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-bold text-foreground">4. Data Retention</h2>
            <p>
              We keep account and order data only as long as needed for service delivery,
              support, operational reporting, and any required compliance obligations.
            </p>
          </section>

          <p className="pt-8 text-sm italic">Last updated: May 4, 2026</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
