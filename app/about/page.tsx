"use client";

import { useSettings } from "@/components/SettingsContext";

export default function AboutPage() {
  const { settings } = useSettings();
  const siteName = settings.site_name || "OUR BRAND";

  return (
    <main className="min-h-screen bg-black pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter text-white mb-12">About Us</h1>
        <div className="prose prose-invert max-w-none">
          <p className="text-xl text-white/60 leading-relaxed uppercase tracking-widest">
            {siteName} is more than just a brand; it's a movement focused on redefining modern elegance for the contemporary era. 
            Founded with a vision of bold sophistication, we curate pieces that speak to the soul.
          </p>
        </div>
      </div>
    </main>
  );
}
