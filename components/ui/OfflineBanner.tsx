"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    setIsOffline(!navigator.onLine);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="fixed bottom-24 left-4 right-4 z-50 flex items-center gap-3 bg-destructive text-destructive-foreground px-4 py-3 rounded-2xl shadow-xl border border-destructive/20 md:max-w-sm md:left-auto md:right-4 md:bottom-4"
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <WifiOff className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-sm">You are offline</div>
            <div className="text-xs opacity-90">Please check your internet connection.</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
