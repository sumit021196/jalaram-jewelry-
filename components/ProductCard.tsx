"use client";
import Link from "next/link";
import { FALLBACK_IMG } from "@/utils/images";
import { useWishlist } from "./wishlist/WishlistContext";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { Product } from "@/types/product";
import { useCart } from "./cart/CartContext";

export default function ProductCard({ product }: { product: Product }) {
  const wishlist = useWishlist();
  const cart = useCart();
  const wished = wishlist.items.some((w) => w.id === product.id);

  const discount = product.mrp ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

  return (
    <div className="group flex flex-col bg-white overflow-hidden fade-in-up shadow-sm hover:shadow-md transition-shadow duration-300 rounded-xl">
      {/* Image Container */}
      <div className="relative aspect-square w-full bg-[#fdf7f8] overflow-hidden">
        <Link href={`/product/${product.id}`} className="block h-full w-full">
          <img
            src={product.media_url || FALLBACK_IMG}
            alt={product.name}
            className="h-full w-full object-cover transition-all duration-700 group-hover:scale-105"
            loading="lazy"
          />
        </Link>

        {/* Rating Badge (Bottom Left of Image) */}
        <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1 px-1.5 py-0.5 bg-white/90 backdrop-blur-sm rounded-md shadow-sm border border-gray-100">
          <span className="text-[10px] font-bold text-gray-800">{product.rating}</span>
          <Star size={10} className="fill-brand-accent text-brand-accent" />
          <div className="w-[1px] h-3 bg-gray-200 mx-0.5" />
          <span className="text-[10px] font-medium text-gray-500">{product.review_count}</span>
        </div>

        {/* Wishlist Button */}
        <button
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          onClick={(e) => {
            e.preventDefault();
            wishlist.toggle({
              id: product.id,
              name: product.name,
              price: product.price,
              image: product.media_url,
            });
          }}
          className={`absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full shadow-sm transition-all duration-300 z-10 ${wished
              ? "bg-brand-red text-white"
              : "bg-white/80 text-gray-400 hover:text-brand-red"
            }`}
        >
          <Heart
            size={16}
            className={wished ? "fill-current" : ""}
          />
        </button>

        {/* Badge (Top Left) */}
        {product.is_bestseller && (
          <div className="absolute top-2 left-2 z-10">
            <span className="px-2 py-0.5 bg-brand-accent text-[8px] font-bold uppercase tracking-tight text-white rounded-sm">
              Bestseller
            </span>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="p-3 flex flex-col gap-1">
        <Link href={`/product/${product.id}`} className="block w-full">
          <h3 className="text-[13px] font-medium text-gray-800 line-clamp-1 group-hover:text-brand-red transition-colors">
            {product.name}
          </h3>
          
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-bold text-gray-900">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
            {product.mrp && product.mrp > product.price && (
              <>
                <span className="text-[11px] text-gray-400 line-through">
                  ₹{product.mrp.toLocaleString("en-IN")}
                </span>
                <span className="text-[11px] font-bold text-green-600">
                  ({discount}% OFF)
                </span>
              </>
            )}
          </div>
        </Link>
        
        {/* Add to Cart Button */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            cart.addItem({
              id: product.id,
              name: product.name,
              price: product.price,
              image: product.media_url || FALLBACK_IMG,
              qty: 1
            });
          }}
          className="w-full mt-2 py-2 bg-brand-red text-white text-[11px] font-bold uppercase tracking-widest rounded-lg shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <ShoppingBag size={14} />
          Add to Cart
        </button>
      </div>
    </div>
  );
}
