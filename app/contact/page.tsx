"use client";

import { useSettings } from "@/components/SettingsContext";

export default function ContactPage() {
  const { settings } = useSettings();
  const contact = settings.contact_info || {
    email: "support@yourbrand.com",
    address: "Location TBD"
  };

  return (
    <main className="min-h-screen bg-black pt-24 pb-12 px-4 md:pt-32 md:pb-20 md:px-6 text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-8xl font-black italic uppercase tracking-tighter mb-8 md:mb-12">Contact</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <div>
            <h3 className="text-[10px] md:text-sm font-black uppercase tracking-[0.3em] mb-3 md:mb-4">Email Us</h3>
            <p className="text-lg md:text-xl text-white/60 italic">{contact.email}</p>
          </div>
          <div>
            <h3 className="text-[10px] md:text-sm font-black uppercase tracking-[0.3em] mb-3 md:mb-4">Location</h3>
            <p className="text-lg md:text-xl text-white/60 italic">{contact.address}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
