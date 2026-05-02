"use client";

import { Footer } from "@/components/layout/Footer";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TermsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      
      <main className="container mx-auto px-4 py-12 md:pt-28 max-w-3xl">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-smooth mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back
        </button>

        <h1 className="text-4xl font-bold tracking-tight mb-8">Terms and Conditions</h1>
        
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using THE EDGE platform, you agree to be bound by these Terms and Conditions. 
              Our services are designed to facilitate food ordering on campus.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">2. Use of Service</h2>
            <p>
              You must be a registered student or staff member to use this service. You are responsible 
              for maintaining the confidentiality of your account and for all activities that occur under your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">3. Ordering and Payments</h2>
            <p>
              All orders are subject to availability. Payments are processed securely. Once an order is 
              placed and confirmed by the vendor, cancellation policies may apply based on the vendor's specific rules.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">4. Privacy Policy</h2>
            <p>
              Your use of THE EDGE is also governed by our Privacy Policy. We collect minimal data necessary 
               to provide the service and improve your experience.
            </p>
          </section>

          <p className="pt-8 text-sm italic">
            Last updated: May 1, 2026
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
