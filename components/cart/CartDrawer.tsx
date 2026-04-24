"use client";

import { useCart } from "./CartContext";
import { FALLBACK_IMG } from "@/utils/images";
import { ShoppingBag, X, Trash2, Plus, Minus, Ticket, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { useSettings } from "@/components/SettingsContext";
import { Truck } from "lucide-react";

export default function CartDrawer() {
    const { settings } = useSettings();
    const cart = useCart();
    const { isOpen, closeCart, items, discount, coupon, showConfetti, setShowConfetti } = cart;
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const total = Math.max(0, subtotal - discount);

    const shippingThreshold = settings.shipping_threshold || 0;
    const isFreeShipping = subtotal >= shippingThreshold;
    const progress = Math.min((subtotal / shippingThreshold) * 100, 100);

    // Prevent background scroll when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
    }, [isOpen]);

    // Handle Confetti Effect (Simple Framer Motion Alternative for now)
    useEffect(() => {
        if (showConfetti) {
            const timer = setTimeout(() => setShowConfetti(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showConfetti, setShowConfetti]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={closeCart}
                    />

                    {/* Drawer Panel */}
                    <motion.div 
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="relative flex h-full w-full max-w-md flex-col bg-background shadow-2xl"
                    >
                        {/* Celebration / Confetti Overlay */}
                        {showConfetti && (
                            <div className="absolute inset-0 pointer-events-none z-[110] overflow-hidden">
                                {[...Array(20)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ 
                                            top: "50%", 
                                            left: "50%", 
                                            scale: 0,
                                            rotate: 0,
                                            opacity: 1 
                                        }}
                                        animate={{ 
                                            top: `${Math.random() * 100}%`, 
                                            left: `${Math.random() * 100}%`,
                                            scale: Math.random() * 1.5,
                                            rotate: Math.random() * 360,
                                            opacity: 0
                                        }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className="absolute w-3 h-3 rounded-full"
                                        style={{ backgroundColor: ['#FF00BF', '#00FFFF', '#FFD700', '#7FFF00'][i % 4] }}
                                    />
                                ))}
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0, y: 20 }}
                                    animate={{ scale: 1, opacity: 1, y: 0 }}
                                    exit={{ scale: 0.5, opacity: 0 }}
                                    className="absolute inset-0 flex items-center justify-center flex-col gap-2"
                                >
                                    <div className="bg-brand-accent text-white px-6 py-3 rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl flex items-center gap-2">
                                        <CheckCircle2 size={20} />
                                        Coupon Applied!
                                    </div>
                                </motion.div>
                            </div>
                        )}

                        {/* Header */}
                        <div className="flex flex-col border-b border-gray-100 bg-white">
                            <div className="flex items-center justify-between px-6 py-5">
                                <div className="flex items-center gap-2">
                                    <ShoppingBag className="text-brand-red" size={22} />
                                    <h2 className="text-xl font-heading font-medium tracking-tight text-gray-800">Your Bag ({items.length})</h2>
                                </div>
                                <button
                                    onClick={closeCart}
                                    className="rounded-full p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-800 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Shipping Progress */}
                            {shippingThreshold > 0 && items.length > 0 && (
                                <div className="px-6 pb-5 animate-in slide-in-from-top duration-500">
                                    <div className="bg-[#fdf7f8] rounded-xl p-4 border border-[#ece1e3]">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-tight">
                                                <Truck size={16} className={isFreeShipping ? "text-green-600" : "text-brand-red"} />
                                                {isFreeShipping ? (
                                                    <span className="text-green-600 tracking-wide">Yay! You get FREE SHIPPING!</span>
                                                ) : (
                                                    <span className="text-gray-600 tracking-wide">Add ₹{(shippingThreshold - subtotal).toLocaleString()} for FREE SHIPPING</span>
                                                )}
                                            </div>
                                            <span className="text-xs font-black text-brand-red">{Math.round(progress)}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-white rounded-full overflow-hidden border border-gray-100">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress}%` }}
                                                className={`h-full transition-all duration-1000 ${isFreeShipping ? "bg-green-600" : "bg-brand-red"}`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-white">
                            {items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                                    <div className="w-20 h-20 bg-[#fdf7f8] rounded-full flex items-center justify-center">
                                        <ShoppingBag className="text-brand-red/20" size={40} />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-xl font-heading font-medium text-gray-800">Your bag is empty</p>
                                        <p className="text-xs text-gray-500 max-w-[200px] mx-auto">Looks like you haven&#39;t added any jewellery yet.</p>
                                    </div>
                                    <button
                                        onClick={closeCart}
                                        className="rounded-full bg-brand-red text-white px-10 py-3.5 font-bold text-xs uppercase tracking-widest hover:bg-brand-red/90 transition shadow-xl"
                                    >
                                        Start Shopping
                                    </button>
                                </div>
                            ) : (
                                items.map((item) => (
                                    <div key={`${item.id}-${item.variant_id || 'base'}-${item.size || 'none'}-${item.color || 'none'}`} className="flex gap-4 group">
                                        <div className="h-24 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-[#fdf7f8] border border-gray-100">
                                            <img
                                                src={item.image || FALLBACK_IMG}
                                                alt={item.name}
                                                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }}
                                            />
                                        </div>
                                        <div className="flex flex-1 flex-col justify-between py-1">
                                            <div className="space-y-1">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="text-xs font-bold text-gray-800 line-clamp-2 pr-4">{item.name}</h3>
                                                    <button
                                                        onClick={() => cart.remove(`${item.id}-${item.variant_id || 'base'}-${item.size || 'none'}-${item.color || 'none'}`)}
                                                        className="text-gray-300 hover:text-brand-red transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-sm font-bold text-gray-900">₹{item.price.toLocaleString('en-IN')}</span>
                                                    <span className="text-[10px] text-gray-400 line-through">₹{(item.price * 1.5).toLocaleString('en-IN')}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between mt-3">
                                                <div className="flex items-center gap-0 bg-gray-50 rounded-lg p-0.5 border border-gray-100">
                                                    <button
                                                        onClick={() => cart.add({ id: item.id, name: item.name, price: item.price, image: item.image, variant_id: item.variant_id, size: item.size, color: item.color }, -1)}
                                                        disabled={item.qty <= 1}
                                                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white text-gray-500 disabled:opacity-30 transition"
                                                    >
                                                        <Minus size={12} />
                                                    </button>
                                                    <span className="w-8 text-center text-xs font-bold text-gray-800">{item.qty}</span>
                                                    <button
                                                        onClick={() => cart.add({ id: item.id, name: item.name, price: item.price, image: item.image, variant_id: item.variant_id, size: item.size, color: item.color }, 1)}
                                                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white text-gray-500 transition"
                                                    >
                                                        <Plus size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Coupon Section in Drawer */}
                        {items.length > 0 && (
                            <DrawerCouponSection cart={cart} />
                        )}

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="border-t border-gray-100 bg-white p-6 space-y-4 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-xs font-medium text-gray-500">
                                        <span>Bag Total</span>
                                        <span>₹{subtotal.toLocaleString()}</span>
                                    </div>
                                    {discount > 0 && (
                                        <div className="flex items-center justify-between text-xs font-bold text-green-600">
                                            <span>Bag Discount</span>
                                            <span>-₹{discount.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-50">
                                        <span>Total Amount</span>
                                        <span>₹{total.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="bg-green-50 p-2 rounded-lg text-center mt-2">
                                        <p className="text-[10px] font-bold text-green-700 uppercase tracking-wide">
                                            You saved ₹{(subtotal - total).toLocaleString()} on this order!
                                        </p>
                                    </div>
                                </div>

                                <Link
                                    href="/cart"
                                    onClick={closeCart}
                                    className="flex h-14 items-center justify-center gap-2 rounded-full bg-brand-red text-white font-bold text-xs uppercase tracking-[0.2em] hover:bg-brand-red/90 transition shadow-xl"
                                >
                                    Proceed to Checkout
                                    <CheckCircle2 size={16} />
                                </Link>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

function DrawerCouponSection({ cart }: { cart: any }) {
    const [input, setInput] = useState(cart.coupon || "");
    const [isApplying, setIsApplying] = useState(false);

    useEffect(() => {
        if (!cart.coupon) setInput("");
        else setInput(cart.coupon);
    }, [cart.coupon]);

    return (
        <div className="px-6 py-4 border-t border-gray-50 bg-[#fdf7f8]/30">
            <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Promo Code</label>
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <input 
                        type="text"
                        placeholder="ENTER CODE"
                        className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider outline-none focus:border-brand-red transition-all"
                        value={input}
                        onChange={(e) => setInput(e.target.value.toUpperCase())}
                        onKeyDown={async (e) => {
                            if (e.key === 'Enter' && !cart.coupon && input) {
                                setIsApplying(true);
                                try {
                                    const res = await cart.applyCoupon(input);
                                    if (!res.success) alert(res.message);
                                } catch (err) {
                                    alert("Error applying coupon");
                                } finally {
                                    setIsApplying(false);
                                }
                            }
                        }}
                        disabled={!!cart.coupon || isApplying}
                    />
                    {cart.coupon && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600">
                            <CheckCircle2 size={14} />
                        </div>
                    )}
                </div>
                {cart.coupon ? (
                    <button 
                        onClick={() => cart.removeCoupon()}
                        className="px-3 text-[9px] font-black uppercase tracking-widest text-brand-red border border-brand-red/10 rounded-xl hover:bg-brand-red/5 transition-all"
                    >
                        Remove
                    </button>
                ) : (
                    <button 
                        onClick={async () => {
                            if (!input || isApplying) return;
                            setIsApplying(true);
                            try {
                                const res = await cart.applyCoupon(input);
                                if (!res.success) alert(res.message);
                            } catch (err) {
                                alert("Error applying coupon");
                            } finally {
                                setIsApplying(false);
                            }
                        }}
                        disabled={!input || isApplying}
                        className="px-4 py-2.5 bg-gray-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center min-w-[70px]"
                    >
                        {isApplying ? <Loader2 size={12} className="animate-spin" /> : "Apply"}
                    </button>
                )}
            </div>
        </div>
    );
}
