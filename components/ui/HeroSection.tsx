"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";

export default function HeroSection({ banners = [] }: { banners?: any[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const activeBanners = banners.filter((b: any) => b.is_active && b.position === 'hero');

    useEffect(() => {
        if (activeBanners.length > 1) {
            const timer = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
            }, 6000);
            return () => clearInterval(timer);
        }
    }, [activeBanners.length]);

    if (activeBanners.length === 0) {
        // Fallback if no banners defined
        return (
            <section className="h-[50vh] md:h-[80vh] flex items-center justify-center bg-background">
                <div className="text-center px-4">
                    <h1 className="text-3xl md:text-7xl font-serif font-bold tracking-tight text-foreground mb-4">THE JEWEL VAULT</h1>
                    <button className="px-8 py-3 bg-foreground text-background font-serif font-bold uppercase tracking-widest text-[10px] rounded-full shadow-2xl hover:bg-brand-accent transition-all">Explore Collections</button>
                </div>
            </section>
        );
    }

    const banner = activeBanners[currentIndex];

    return (
        <section className="relative h-[45vh] md:h-[85vh] lg:h-[95vh] w-full overflow-hidden bg-background">
            {activeBanners.map((b, idx) => (
                <div 
                    key={b.id} 
                    className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                    {/* Background Overlay - subtly darker for text readability */}
                    <div className="absolute inset-0 z-10 bg-gradient-to-t from-background via-black/20 to-transparent" />
                    
                    <Image 
                        src={b.image_url} 
                        alt={b.title || 'Hero'} 
                        fill
                        priority={idx === 0}
                        fetchPriority={idx === 0 ? "high" : "auto"}
                        className="h-full w-full object-cover transition-transform duration-[10000ms] ease-out scale-100 animate-[zoom-out_10s_ease-out_forwards]"
                    />

                    {/* Content Overlay */}
                    <div className="absolute inset-0 z-20 flex items-center justify-center text-center px-6">
                        <div className="max-w-4xl w-full space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                             <h1 className="text-2xl md:text-7xl lg:text-8xl font-heading font-normal text-white drop-shadow-lg leading-tight">
                                 {b.title}
                             </h1>
                             <p className="text-[10px] md:text-xl text-white/90 font-light max-w-2xl mx-auto tracking-wide line-clamp-2">
                                 {b.subtitle}
                             </p>

                             <div className="flex justify-center pt-2 md:pt-8">
                                 <Link
                                     href={b.link_url || '/products'}
                                     className="inline-flex items-center justify-center gap-2 px-8 md:px-14 py-2.5 md:py-4 bg-brand-red text-white font-sans font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs hover:bg-brand-red/90 transition-all transform hover:-translate-y-1 active:scale-95 shadow-2xl rounded-full"
                                 >
                                     {b.button_text || 'Shop Now'}
                                     <ArrowRight size={14} className="md:w-4 md:h-4" />
                                 </Link>
                             </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Pagination Diamond Dots (Tanishq Style) */}
            {activeBanners.length > 1 && (
                <div className="absolute bottom-6 md:bottom-12 left-1/2 -translate-x-1/2 z-30 flex gap-4">
                    {activeBanners.map((_, idx) => (
                        <button 
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`w-2.5 h-2.5 rotate-45 transition-all duration-300 transform ${idx === currentIndex ? 'bg-[#8B1D3D] scale-125 border border-white' : 'bg-white/40 border border-transparent'}`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}

// Add animation to globals or here via style tag if needed
// @keyframes zoom-out { from { transform: scale(1.1); } to { transform: scale(1); } }
