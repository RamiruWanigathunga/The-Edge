"use client";

import { useState, useEffect } from "react";
import { Smartphone, X } from "lucide-react";

export const PWABanner = () => {
  const [dismissed, setDismissed] = useState(false);
  const [closing, setClosing] = useState(false);
  const [isInstalled, setIsInstalled] = useState(true); // Default to true to prevent hydration flash

  useEffect(() => {
    // Check if the app is already installed/running as a standalone PWA
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || 
      ("standalone" in navigator && (navigator as any).standalone === true);
      
    const isInstalledPreviously = localStorage.getItem("pwa_installed") === "true";

    if (isStandalone || isInstalledPreviously) {
      if (isStandalone) {
        localStorage.setItem("pwa_installed", "true");
      }
      setIsInstalled(true);
      return;
    }

    setIsInstalled(false);

    const handleAppInstalled = () => {
      localStorage.setItem("pwa_installed", "true");
      setClosing(true);
      setTimeout(() => setDismissed(true), 300);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    // Auto-hide after 10 seconds
    const timeout = setTimeout(() => {
      setClosing(true);
      setTimeout(() => setDismissed(true), 300); // Wait for transition
    }, 10000);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);
  

  const handleDismiss = () => {
    setClosing(true);
    setTimeout(() => setDismissed(true), 300);
  };

  if (isInstalled || dismissed) return null;

  return (
    <div 
      className={`fixed bottom-20 md:bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-[340px] z-50 animate-slide-in-right transition-all duration-300 ${closing ? "opacity-0 translate-x-8" : "opacity-100"}`}
    >
      <div className="bg-card border border-border rounded-3xl p-4 shadow-elevated flex items-start gap-3">
        <div className="w-10 h-10 rounded-2xl hero-gradient grid place-items-center text-white shrink-0">
          <Smartphone className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm tracking-tight">Add to Home Screen</div>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            Tap Install in the popup to add this as an app.
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="w-7 h-7 rounded-full grid place-items-center hover:bg-secondary transition-smooth focus-dashed shrink-0"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};
