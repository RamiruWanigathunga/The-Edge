import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "./providers";
import { ServiceWorkerRegister } from "@/components/layout/ServiceWorkerRegister";
import { BottomNav } from "@/components/layout/BottomNav";
import { Header } from "@/components/layout/Header";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

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
    default: "The Edge",
    template: "%s | The Edge",
  },
  description:
    "Skip the queue at The Edge Canteen | NSBM Green University",
  keywords: ["The Edge", "NSBM Green University", "NSBM Edge", "NSBM", "NSBM Canteen"],
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "The Edge",
  },
  openGraph: {
    title: "The Edge",
    description: "Skip the queue at The Edge Canteen.",
    type: "website",
    siteName: "The Edge",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} bg-background`}
      suppressHydrationWarning
    >
      <body className="antialiased font-sans bg-background">
        <Script
          id="theme-color-sync-blocking"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}var c=t==='dark'?'#000000':'#ffffff';var metas=document.querySelectorAll('meta[name="theme-color"]');if(metas.length){metas.forEach(function(m){m.removeAttribute('media');m.setAttribute('content',c);});}else{var m=document.createElement('meta');m.setAttribute('name','theme-color');m.setAttribute('content',c);document.head.appendChild(m);}}catch(e){}})();`,
          }}
        />
        <Providers>
          <ServiceWorkerRegister />
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
          <Analytics />
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  );
}

import LayoutWrapper from "@/components/layout/LayoutWrapper";
