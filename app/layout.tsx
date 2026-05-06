import type { Metadata } from "next";
import { Outfit, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart/CartContext";
import { WishlistProvider } from "@/components/wishlist/WishlistContext";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import AnalyticsTracker from "@/components/AnalyticsTracker";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export async function generateMetadata() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/settings`, { cache: 'no-store' });
    const data = await res.json();
    const settings = data.settings || {};
    const seo = settings.seo_meta || {};
    
    return {
      title: settings.site_name || "Store",
      description: seo.description || "Curated essentials for the contemporary soul.",
      keywords: seo.keywords || "ecommerce, store",
    };
  } catch (e) {
    return {
      title: "Store",
      description: "Curated essentials for the contemporary soul.",
    };
  }
}

import { SettingsProvider } from "@/components/SettingsContext";

import FloatingChat from "@/components/ui/FloatingChat";
import AuthFeedback from "@/components/ui/AuthFeedback";
import { Suspense } from "react";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <SettingsProvider>
          <WishlistProvider>
            <CartProvider>
              <AnalyticsTracker />
              <Navbar />
              {children}
              <Footer />
              <Suspense fallback={null}>
                <AuthFeedback />
              </Suspense>
              <FloatingChat />
              <Toaster position="top-center" richColors />
            </CartProvider>
          </WishlistProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
