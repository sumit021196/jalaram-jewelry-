"use client";

import { useSettings } from "@/components/SettingsContext";

export default function TermsPage() {
  const { settings } = useSettings();
  const siteName = settings.site_name || "OUR BRAND";

  return (
    <main className="min-h-screen bg-black pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter text-white mb-12">Terms of Service</h1>
        <div className="prose prose-invert max-w-none text-white/60 uppercase tracking-widest text-sm leading-loose">
          <p>By using {siteName}, you agree to our terms and conditions.</p>
          <p>All content on this site is property of {siteName}.</p>
        </div>
      </div>
    </main>
  );
}
