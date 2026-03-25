"use client";

import Link from "next/link";

const collections = [
  {
    title: "Classic Gold",
    subtitle: "Timeless elegance in every piece",
    image_url: "https://images.unsplash.com/photo-1613133310164-28399321307c?q=80&w=800&auto=format&fit=crop",
    link: "/products?search=gold"
  },
  {
    title: "Diamond Shine",
    subtitle: "Brilliance that captures the light",
    image_url: "https://images.unsplash.com/photo-1598560912005-59765abc33e6?q=80&w=800&auto=format&fit=crop",
    link: "/products?search=diamond"
  },
  {
    title: "Floral Bloom",
    subtitle: "Nature inspired craftsmanship",
    image_url: "https://images.unsplash.com/photo-1635767798638-3e25273a8236?q=80&w=800&auto=format&fit=crop",
    link: "/products?search=floral"
  },
  {
    title: "Modern Minimal",
    subtitle: "Statement pieces for everyday",
    image_url: "https://images.unsplash.com/photo-1626784215021-2e39ccf971cd?q=80&w=800&auto=format&fit=crop",
    link: "/products?search=minimal"
  }
];

export default function FeaturedCollections() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-[1440px] mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground tracking-tight">
            Our Signature Collections
          </h2>
          <div className="w-24 h-1 bg-brand-accent mx-auto rounded-full" />
          <p className="text-muted-foreground max-w-xl mx-auto font-medium">
            Explore our curated collections, each telling a unique story of beauty and tradition.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {collections.map((col, idx) => (
            <Link 
              key={idx} 
              href={col.link} 
              className="group relative overflow-hidden rounded-[32px] shadow-xl hover:shadow-2xl transition-all duration-700"
            >
              <div className="aspect-[4/5] overflow-hidden">
                <img 
                  src={col.image_url} 
                  alt={col.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-6 flex flex-col justify-end text-white">
                <h3 className="text-xl md:text-2xl font-serif font-bold leading-none mb-2">
                  {col.title}
                </h3>
                <p className="text-[10px] md:text-xs opacity-80 uppercase tracking-[0.2em] font-medium text-brand-accent">
                  {col.subtitle}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
