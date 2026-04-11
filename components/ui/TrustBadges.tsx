"use client";

import { ShieldCheck, Truck, RotateCcw, Award } from "lucide-react";

const badges = [
  {
    icon: ShieldCheck,
    title: "6-Month Warranty",
    desc: "Quality guaranteed on every piece"
  },
  {
    icon: Truck,
    title: "Free Shipping",
    desc: "Across India on prepaid orders"
  },
  {
    icon: RotateCcw,
    title: "30-Day Returns",
    desc: "Hassle-free exchange policy"
  },
  {
    icon: Award,
    title: "Plating Guarantee",
    desc: "Long-lasting premium finish"
  }
];

export default function TrustBadges() {
  return (
    <section className="bg-brand-red py-8 md:py-12">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {badges.map((badge, idx) => (
            <div key={idx} className="flex flex-col items-center text-center gap-3 group">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 group-hover:bg-brand-accent transition-colors duration-300">
                <badge.icon size={24} className="text-white" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">{badge.title}</h4>
                <p className="text-[10px] text-white/70 tracking-tight">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
