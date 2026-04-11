"use client";
import Link from "next/link";
import { useState, useMemo } from "react";
import { useCart } from "@/components/cart/CartContext";
import { FALLBACK_IMG } from "@/utils/images";
import { ShoppingBag, Trash2, Plus, Minus, ArrowLeft, ShieldCheck, MapPin, Truck, AlertCircle, Loader2 } from "lucide-react";
import type { ServiceabilityResponse } from "@/services/deliveryone.service";


export default function CartPage() {
  const cart = useCart();
  const [pincode, setPincode] = useState("");
  const [shippingInfo, setShippingInfo] = useState<ServiceabilityResponse | null>(null);
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);
  const [pincodeError, setPincodeError] = useState("");

  const total = useMemo(() => cart.items.reduce((s, i) => s + i.price * i.qty, 0), [cart.items]);



  const handlePincodeChange = async (val: string) => {
    setPincode(val);
    setPincodeError("");
    if (val.length === 6) {
      setIsCheckingPincode(true);
      try {
        const response = await fetch(`/api/shipping/serviceability?pincode=${val}`);
        const res = await response.json() as ServiceabilityResponse;
        setShippingInfo(res);
        if (!res.serviceable) {
          setPincodeError(res.error || "Area not serviceable");
        }
      } catch (err) {
        setPincodeError("Failed to check serviceability");
      } finally {
        setIsCheckingPincode(false);
      }
    } else {
      setShippingInfo(null);
    }
  };


  if (cart.items.length === 0) {
    return (
      <main className="min-h-[80vh] flex flex-col items-center justify-center px-6">
        <div className="w-20 h-20 bg-zinc-50 rounded-[2.5rem] flex items-center justify-center mb-6 border border-zinc-100 shadow-sm">
          <ShoppingBag className="text-zinc-300" size={32} />
        </div>
        <h1 className="text-2xl font-serif font-bold text-zinc-900 tracking-tight">Your selection is empty</h1>
        <p className="text-zinc-500 mt-2 text-center text-sm max-w-[280px]">
          Discover our vault to find your next treasure. Start exploring our collections.
        </p>
        <Link
          href="/products"
          className="mt-8 px-8 py-4 bg-zinc-900 text-white text-sm font-serif font-bold rounded-2xl hover:bg-zinc-800 transition active:scale-[0.98] shadow-xl shadow-zinc-200"
        >
          Explore Collections
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fdf7f8]/50 pb-32 lg:pb-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-10 px-1">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl md:text-4xl font-heading font-medium text-gray-900 tracking-tight">Your Shopping Bag</h1>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em]">{cart.items.length} Items Selected</p>
          </div>
          <Link href="/products" className="text-[10px] font-bold text-gray-400 hover:text-brand-red transition flex items-center gap-2 uppercase tracking-widest border border-gray-100 bg-white px-4 py-2 rounded-full shadow-sm">
            <ArrowLeft size={14} />
            <span>Continue Shopping</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 items-start">

          {/* ── Cart Items ── */}
          <section className="space-y-4">
            {cart.items.map((i) => (
              <div key={`${i.id}-${i.variant_id || 'base'}-${i.size || 'none'}-${i.color || 'none'}`} className="group relative bg-white rounded-3xl p-4 flex gap-6 border border-gray-100 hover:shadow-xl hover:shadow-brand-red/5 transition-all duration-500">
                <div className="relative h-32 w-28 flex-shrink-0 overflow-hidden rounded-2xl bg-[#fdf7f8] border border-gray-50">
                  <img
                    src={i.image || FALLBACK_IMG}
                    alt={i.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }}
                  />
                  {/* Badge */}
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-brand-accent/90 backdrop-blur-sm text-[8px] font-bold text-white rounded-sm uppercase tracking-tight">
                    Premium
                  </div>
                </div>

                <div className="flex-1 flex flex-col py-1">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-gray-900 leading-tight pr-8">{i.name}</h3>
                      {(i.size || i.color) && (
                          <div className="flex items-center gap-2 mt-2">
                              {i.size && <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">SIZE: {i.size}</span>}
                              {i.color && <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">METAL: {i.color}</span>}
                          </div>
                      )}
                      <div className="flex items-center gap-3 mt-3">
                        <span className="text-lg font-bold text-brand-red">₹{i.price.toLocaleString('en-IN')}</span>
                        <span className="text-xs text-gray-400 line-through">₹{(i.price * 1.5).toLocaleString('en-IN')}</span>
                        <span className="text-[10px] font-bold text-green-600">(33% OFF)</span>
                      </div>
                    </div>
                    <button
                      onClick={() => cart.remove(`${i.id}-${i.variant_id || 'base'}-${i.size || 'none'}-${i.color || 'none'}`)}
                      className="p-2.5 text-gray-300 hover:text-brand-red hover:bg-[#fdf7f8] rounded-2xl transition-all"
                      aria-label="Remove item"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-100">
                      <button
                        onClick={() => cart.add({ id: i.id, name: i.name, price: i.price, image: i.image, variant_id: i.variant_id, size: i.size, color: i.color }, -1)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white text-gray-500 transition active:scale-90"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 text-center text-sm font-bold text-gray-900">{i.qty}</span>
                      <button
                        onClick={() => cart.add({ id: i.id, name: i.name, price: i.price, image: i.image, variant_id: i.variant_id, size: i.size, color: i.color }, 1)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white text-gray-500 transition active:scale-90"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Subtotal</p>
                       <p className="text-base font-bold text-gray-900 tracking-tight">₹{(i.price * i.qty).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* ── Checkout Sidebar ── */}
          <aside className="lg:sticky lg:top-24 space-y-6">
            <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
              <h2 className="text-xl font-heading font-medium text-gray-900 mb-8 flex items-center justify-between">
                Order Summary
                <ShieldCheck size={20} className="text-brand-accent" />
              </h2>

              <div className="space-y-6 mb-8">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-3 ml-1">Delivery Pincode</label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Check serviceability"
                      value={pincode}
                      onChange={(e) => handlePincodeChange(e.target.value.replace(/\D/g, ''))}
                      className={`w-full rounded-2xl border ${pincodeError ? 'border-brand-red/20 bg-brand-red/5' : 'border-gray-100 bg-[#fdf7f8]/50'} px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-brand-red/5 focus:bg-white focus:border-brand-red outline-none transition-all`}
                    />
                    <div className="absolute right-5 top-1/2 -translate-y-1/2">
                      {isCheckingPincode ? (
                        <Loader2 size={18} className="animate-spin text-brand-red" />
                      ) : shippingInfo?.serviceable ? (
                        <CheckCircle2 size={18} className="text-green-600" />
                      ) : pincode.length === 6 ? (
                        <AlertCircle size={18} className="text-brand-red" />
                      ) : (
                        <MapPin size={18} className="text-gray-300" />
                      )}
                    </div>
                  </div>
                  {pincodeError && (
                    <p className="text-[11px] font-bold text-brand-red mt-3 ml-1 uppercase tracking-wider flex items-center gap-2">
                      <AlertCircle size={14} />
                      {pincodeError}
                    </p>
                  )}
                  {shippingInfo?.serviceable && (
                    <div className="bg-green-50 p-3 rounded-xl mt-4 border border-green-100 animate-in fade-in duration-500">
                        <p className="text-[10px] font-bold text-green-700 uppercase tracking-wider flex items-center gap-2">
                          <Truck size={14} />
                          Delivering in ~{shippingInfo.estimated_delivery}
                        </p>
                    </div>
                  )}
                </div>

              </div>

              <div className="space-y-4 pt-8 border-t border-gray-50">
                <div className="flex justify-between items-center text-sm font-bold text-gray-400">
                  <span className="uppercase tracking-widest text-[10px]">Bag Total</span>
                  <span className="text-gray-900">₹{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold text-gray-400">
                  <span className="uppercase tracking-widest text-[10px]">Shipping</span>
                  {shippingInfo?.serviceable ? (
                     <span className="text-green-600">FREE</span>
                  ) : (
                    <span className="text-gray-300 italic">No Pincode</span>
                  )}
                </div>
                <div className="flex justify-between items-center pt-5 border-t border-gray-100 group">
                  <span className="text-xl font-heading font-medium text-gray-900">Grand Total</span>
                  <span className="text-2xl font-bold text-brand-red tracking-tight">₹{total.toLocaleString('en-IN')}</span>
                </div>

                <div className="bg-brand-red/5 p-3 rounded-xl text-center mt-4">
                    <p className="text-[10px] font-bold text-brand-red uppercase tracking-[0.1em]">
                       Saving ₹{(total * 0.5).toLocaleString()} on this order
                    </p>
                </div>

                <div className="pt-4">
                  <Link
                    href={shippingInfo?.serviceable ? "/checkout" : "#"}
                    onClick={(e) => {
                      if (!shippingInfo?.serviceable) {
                        e.preventDefault();
                        setPincodeError("Verify your pincode to proceed");
                      }
                    }}
                    className={`flex items-center justify-center gap-3 w-full rounded-full px-8 py-5 font-bold transition-all shadow-2xl ${
                      shippingInfo?.serviceable 
                        ? "bg-brand-red text-white hover:bg-brand-red/90 hover:scale-[1.02] active:scale-[0.98] shadow-brand-red/20" 
                        : "bg-gray-100 text-gray-300 cursor-not-allowed shadow-none"
                    } text-xs uppercase tracking-[0.2em]`}
                  >
                    Checkout Securely
                  </Link>
                </div>
                
              </div>
            </div>

            <div className="px-6 py-5 bg-[#fdf7f8] border border-brand-red/10 rounded-[2rem] flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                <ShieldCheck size={22} className="text-brand-accent" />
              </div>
              <div className="space-y-0.5">
                  <p className="text-[11px] font-bold text-gray-800 uppercase tracking-wide">100% Reliable</p>
                  <p className="text-[10px] text-gray-400 uppercase font-medium">Safe & Encrypted Payments</p>
              </div>
            </div>

          </aside>
        </div>
      </div>

      {/* ── Mobile Sticky Checkout ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100 p-5 lg:hidden z-50">
        <div className="max-w-md mx-auto flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-1">Total Amount</span>
            <span className="text-xl font-bold text-brand-red tracking-tight leading-none">₹{total.toLocaleString()}</span>
          </div>
          <Link
            href={shippingInfo?.serviceable ? "/checkout" : "#"}
            onClick={(e) => {
              if (!shippingInfo?.serviceable) {
                e.preventDefault();
                setPincodeError("Enter Pincode Above");
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-4.5 rounded-full font-bold text-xs uppercase tracking-[0.2em] shadow-xl transition-all h-14 ${
              shippingInfo?.serviceable 
                ? "bg-brand-red text-white shadow-brand-red/20 active:scale-[0.98]" 
                : "bg-gray-100 text-gray-300"
            }`}
          >
            Checkout
          </Link>
        </div>
      </div>
    </main>
  );
}
