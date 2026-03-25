"use client";

import { useEffect, useState } from "react";
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
            <section className="h-[80vh] flex items-center justify-center bg-background">
                <div className="text-center space-y-6">
                    <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight text-foreground">THE JEWEL VAULT</h1>
                    <button className="px-12 py-4 bg-foreground text-background font-serif font-bold uppercase tracking-widest text-xs rounded-full shadow-2xl hover:bg-brand-accent transition-all">Explore Collections</button>
                </div>
            </section>
        );
    }

    const banner = activeBanners[currentIndex];

    return (
        <section className="relative h-[60vh] md:h-[85vh] lg:h-[95vh] w-full overflow-hidden bg-background">
            {activeBanners.map((b, idx) => (
                <div 
                    key={b.id} 
                    className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                    {/* Background Overlay - subtly darker for text readability */}
                    <div className="absolute inset-0 z-10 bg-gradient-to-t from-background via-black/20 to-transparent" />
                    
                    <img 
                        src={b.image_url} 
                        alt={b.title || 'Hero'} 
                        className="h-full w-full object-cover transition-transform duration-[10000ms] ease-out scale-100 animate-[zoom-out_10s_ease-out_forwards]"
                    />

                    {/* Content Overlay */}
                    <div className="absolute inset-0 z-20 flex items-center justify-center px-6 lg:px-12">
                        <div className={`max-w-[1440px] w-full ${b.style_type === 'split' ? 'grid grid-cols-1 lg:grid-cols-2' : 'text-center'}`}>
                            <div className="space-y-4 md:space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                                {b.style_type === 'wtflex_bold' || b.style_type === 'luxury_bold' ? (
                                    <>
                                        <h1 className="text-3xl md:text-7xl lg:text-8xl font-serif font-bold text-white leading-tight filter drop-shadow-xl">
                                            {b.title}
                                        </h1>
                                        <p className="text-xs md:text-base font-serif font-bold tracking-[0.2em] text-brand-accent uppercase mt-2">
                                            {b.subtitle}
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <h1 className="text-3xl md:text-6xl lg:text-7xl font-serif font-bold text-white leading-tight">
                                            {b.title}
                                        </h1>
                                        <p className="text-xs md:text-base text-white/90 font-medium max-w-xl mx-auto mt-4 px-4 line-clamp-2 md:line-clamp-none">
                                            {b.subtitle}
                                        </p>
                                    </>
                                )}

                                <div className={`flex flex-col sm:flex-row gap-4 pt-4 md:pt-6 ${b.style_type === 'split' ? 'justify-start' : 'justify-center'}`}>
                                    <Link
                                        href={b.link_url || '/products'}
                                        className="inline-flex items-center justify-center gap-3 px-8 md:px-12 py-3 md:py-4 bg-[#8B1D3D] text-white font-serif font-bold uppercase tracking-widest text-[10px] md:text-xs hover:bg-[#A32348] transition-all transform hover:-translate-y-1 active:scale-95 shadow-xl rounded-full"
                                    >
                                        <ShoppingBag size={16} />
                                        {b.cta_text || 'Shop Now'}
                                    </Link>
                                </div>
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
