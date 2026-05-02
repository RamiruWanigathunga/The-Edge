import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ServiceWorkerRegister } from "@/components/layout/ServiceWorkerRegister";
import { BottomNav } from "@/components/layout/BottomNav";
import { Header } from "@/components/layout/Header";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "THE EDGE | Campus food, sorted",
    template: "%s | THE EDGE",
  },
  description:
    "Order ahead. Skip the queue. Pick up when ready. Campus food ordering PWA.",
  keywords: ["campus food", "university canteen", "food ordering", "Sri Lanka", "PWA"],
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "THE EDGE",
  },
  openGraph: {
    title: "THE EDGE | Campus food, sorted",
    description: "Order ahead. Skip the queue. Pick up when ready.",
    type: "website",
    siteName: "THE EDGE",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#090e1a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased font-sans">
        <Providers>
          <ServiceWorkerRegister />
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}

import LayoutWrapper from "@/components/layout/LayoutWrapper";
