"use client";
import Link from "next/link";
import { FALLBACK_IMG } from "@/utils/images";
import { useWishlist } from "./wishlist/WishlistContext";
import { Heart, ShoppingBag } from "lucide-react";

type Product = {
  id: string | number;
  name: string;
  price: number;
  mediaUrl?: string;
};

export default function ProductCard({ product }: { product: Product }) {
  const wishlist = useWishlist();
  const wished = wishlist.items.some((w) => w.id === product.id);

  return (
    <div className="group flex flex-col bg-background overflow-hidden fade-in-up">
      {/* Image Container */}
      <div className="relative aspect-[3/4] w-full bg-muted overflow-hidden">
        <Link href={`/product/${product.id}`} className="block h-full w-full">
          <img
            src={product.mediaUrl || FALLBACK_IMG}
            alt={product.name}
            className="h-full w-full object-cover transition-all duration-1000 group-hover:scale-110 group-hover:rotate-1"
            loading="lazy"
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement;
              if (img.src !== FALLBACK_IMG) img.src = FALLBACK_IMG;
            }}
          />
        </Link>

        {/* Brand Label/Badge (Elegant Style) */}
        <div className="absolute top-3 left-3 z-10">
            <span className="px-2 py-0.5 bg-white/90 text-[8px] font-serif font-bold uppercase tracking-[0.2em] text-brand-red border border-brand-accent/20 rounded-full shadow-sm">
                Masterpiece
            </span>
        </div>

        {/* Wishlist button */}
        <button
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          onClick={(e) => {
            e.preventDefault();
            wishlist.toggle({
              id: product.id,
              name: product.name,
              price: product.price,
              image: product.mediaUrl,
            });
          }}
          className={`absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 z-10 border ${wished
              ? "bg-brand-red border-brand-red text-white scale-110 shadow-lg"
              : "bg-background/40 border-foreground/10 text-foreground hover:bg-foreground hover:text-background hover:scale-110"
            }`}
        >
          <Heart
            size={18}
            className={wished ? "fill-current" : ""}
          />
        </button>

        {/* Hover Action Bar (Desktop) */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-20 hidden md:block">
             <Link 
                href={`/product/${product.id}`}
                className="flex items-center justify-center gap-3 w-full py-4 bg-foreground text-background font-serif font-bold uppercase tracking-widest text-[10px] hover:bg-brand-accent transition-all animate-shimmer"
             >
                <ShoppingBag size={14} />
                Discover Piece
             </Link>
        </div>
      </div>

      {/* Info Section */}
      <div className="py-4 md:py-6 flex flex-col items-center text-center gap-1.5 px-2">
        <Link href={`/product/${product.id}`} className="block w-full">
          <h3 className="text-sm md:text-base font-serif font-bold text-foreground line-clamp-1 group-hover:text-brand-accent transition-colors duration-300">
            {product.name}
          </h3>
          <div className="flex items-center justify-center gap-3 mt-1">
              <span className="text-base md:text-xl font-bold text-gray-900">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              <span className="text-[10px] font-medium text-gray-400 line-through">
                ₹{(product.price * 1.2).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </span>
          </div>
        </Link>
        
        {/* Mobile Action (Visible only on mobile) */}
        <div className="w-full mt-2 md:hidden">
             <Link 
                href={`/product/${product.id}`}
                className="flex items-center justify-center w-full py-2.5 bg-background border border-foreground/10 text-[10px] font-serif font-bold uppercase tracking-widest text-foreground active:bg-muted transition-all rounded-lg"
             >
                Discover
             </Link>
        </div>
      </div>
    </div>
  );
}
