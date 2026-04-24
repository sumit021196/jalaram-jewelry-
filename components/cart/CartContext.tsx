"use client";
import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";

type CartItem = {
  id: string | number;
  name: string;
  price: number;
  image?: string;
  qty: number;
  variant_id?: string;
  size?: string;
  color?: string;
};

type CartCtx = {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (uniqueId: string) => void;
  clear: () => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  coupon: string | null;
  activeCoupon: any | null;
  discount: number;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  showConfetti: boolean;
  setShowConfetti: (show: boolean) => void;
};

const Ctx = createContext<CartCtx | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeCoupon, setActiveCoupon] = useState<any | null>(null);
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  const subtotal = useMemo(() => items.reduce((s, i) => s + i.price * i.qty, 0), [items]);

  // Fetch coupons on mount
  useEffect(() => {
    const fetchCoupons = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('coupons').select('*').eq('active', true);
      if (data) setAvailableCoupons(data);
    };
    fetchCoupons();
  }, []);

  const calculateDiscount = (cpn: any, total: number) => {
    if (!cpn) return 0;
    let d = 0;
    if (cpn.discount_type === 'percentage') {
      d = (total * Number(cpn.discount_value)) / 100;
    } else {
      d = Number(cpn.discount_value);
    }
    return Math.min(d, total);
  };

  const discount = useMemo(() => calculateDiscount(activeCoupon, subtotal), [activeCoupon, subtotal]);

  // Auto-apply logic
  useEffect(() => {
    if (!isMounted || availableCoupons.length === 0) return;

    // 1. Check if current coupon is still valid
    if (activeCoupon) {
      if (subtotal < (activeCoupon.min_order_value || 0)) {
        setActiveCoupon(null);
      } else {
        // Current is valid, keep it (respecting user choice or previous auto-apply)
        return;
      }
    }

    // 2. If no coupon, find the best eligible one
    const eligible = availableCoupons.filter(c => 
      subtotal >= (c.min_order_value || 0) && 
      (!c.expiry_date || new Date(c.expiry_date) > new Date()) &&
      (!c.max_uses || c.uses_count < c.max_uses)
    );

    if (eligible.length > 0) {
      // Find best (highest discount)
      const best = eligible.reduce((prev, current) => {
        const d1 = calculateDiscount(prev, subtotal);
        const d2 = calculateDiscount(current, subtotal);
        return d2 > d1 ? current : prev;
      });

      if (!activeCoupon || activeCoupon.code !== best.code) {
        setActiveCoupon(best);
      }
    }
  }, [subtotal, availableCoupons, isMounted, activeCoupon]);

  useEffect(() => {
    setIsMounted(true);
    try {
      const raw = localStorage.getItem("cart");
      if (raw) setItems(JSON.parse(raw));
      
      const savedCoupon = localStorage.getItem("applied_coupon_data");
      if (savedCoupon) {
          setActiveCoupon(JSON.parse(savedCoupon));
      }
    } catch (err) {
      console.error("Cart init error", err);
    }
  }, []);

  // Sync coupon to localStorage whenever it changes
  useEffect(() => {
    if (!isMounted) return;
    if (activeCoupon) {
      localStorage.setItem("applied_coupon_data", JSON.stringify(activeCoupon));
    } else {
      localStorage.removeItem("applied_coupon_data");
    }
  }, [activeCoupon, isMounted]);

  // Clear cart on logout
  useEffect(() => {
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setItems([]);
        setActiveCoupon(null);
        localStorage.removeItem("cart");
        localStorage.removeItem("applied_coupon_data");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem("cart", JSON.stringify(items));
    } catch {}
  }, [items, isMounted]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const applyCoupon = useCallback(async (code: string) => {
      try {
          const res = await fetch('/api/coupons/validate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code: code.toUpperCase(), cartTotal: subtotal })
          });

          const data = await res.json();

          if (!data.success) {
              return { success: false, message: data.error || "Invalid coupon code" };
          }

          setActiveCoupon(data.coupon);
          setShowConfetti(true);
          
          return { success: true, message: "Coupon Applied!" };
      } catch (err) {
          console.error("Coupon API error:", err);
          return { success: false, message: "Network error. Please try again." };
      }
  }, [subtotal]);

  const removeCoupon = useCallback(() => {
    setActiveCoupon(null);
  }, []);

  const api = useMemo<CartCtx>(() => ({
    items,
    isOpen,
    openCart,
    closeCart,
    coupon: activeCoupon?.code || null,
    activeCoupon,
    discount,
    applyCoupon,
    removeCoupon,
    showConfetti,
    setShowConfetti,
    add: (i, q = 1) => {
      setItems((prev) => {
        const idx = prev.findIndex((p) => p.id === i.id && p.variant_id === i.variant_id && p.size === i.size && p.color === i.color);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = { ...copy[idx], qty: copy[idx].qty + q };
          return copy;
        }
        return [...prev, { ...i, qty: q }];
      });
      if (q > 0) {
          openCart();
      }
    },
    remove: (uniqueId) => setItems((p) => p.filter((x) => `${x.id}-${x.variant_id || 'base'}-${x.size || 'none'}-${x.color || 'none'}` !== uniqueId)),
    clear: () => {
        setItems([]);
        setActiveCoupon(null);
        localStorage.removeItem("applied_coupon_data");
    },
  }), [items, isOpen, openCart, closeCart, activeCoupon, discount, applyCoupon, removeCoupon, showConfetti]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
}
