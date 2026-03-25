"use client";
import Link from "next/link";
import { useWishlist } from "@/components/wishlist/WishlistContext";
import { useCart } from "@/components/cart/CartContext";
import { FALLBACK_IMG } from "@/utils/images";

export default function WishlistPage() {
  const wishlist = useWishlist();
  const cart = useCart();
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-serif font-bold text-foreground">Your Vault</h1>
      {wishlist.items.length === 0 ? (
        <div className="mt-6 rounded-2xl border bg-white p-6 text-center shadow-sm">
          <p className="text-sm font-medium text-gray-500">Your vault is currently empty.</p>
          <Link href="/products" className="mt-4 inline-block rounded-xl bg-foreground text-background px-6 py-2 text-xs font-serif font-bold uppercase tracking-widest hover:bg-brand-accent transition shadow-lg">Discover Treasures</Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlist.items.map((w) => (
            <div key={w.id} className="rounded-2xl border bg-white overflow-hidden">
              <img src={w.image || FALLBACK_IMG} alt={w.name} className="w-full aspect-[4/5] object-cover" onError={(e)=>{const img=e.currentTarget; img.src=FALLBACK_IMG;}} />
              <div className="p-4">
                <div className="text-sm font-serif font-bold text-foreground line-clamp-1 uppercase tracking-tight">{w.name}</div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs font-serif font-bold text-brand-accent italic tracking-tight">₹{w.price.toLocaleString('en-IN')}</span>
                  <div className="flex items-center gap-3">
                    <button onClick={()=>cart.add({id:w.id,name:w.name,price:w.price,image:w.image},1)} className="text-[10px] font-bold uppercase tracking-widest text-foreground hover:text-brand-accent transition">Add to Selection</button>
                    <button onClick={()=>wishlist.remove(w.id)} className="text-[10px] font-bold uppercase tracking-widest text-red-400 hover:text-red-500 transition">Remove</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
