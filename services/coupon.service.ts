import { createClient } from '@/utils/supabase/server';

export const couponService = {
  async getAllCoupons() {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createCoupon(coupon: any) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('coupons')
      .insert(coupon)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateCoupon(id: string, updates: any) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('coupons')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteCoupon(id: string) {
    const supabase = await createClient();
    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  async validateCoupon(code: string, userId?: string, cartTotal: number = 0) {
    const supabase = await createClient();
    
    // 1. Fetch coupon
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.trim().toUpperCase())
      .single();

    if (error || !coupon) throw new Error("Invalid coupon code");
    
    // 2. Check Active Status
    if (!coupon.active) throw new Error("This coupon is no longer active");

    // 3. Check Expiry
    if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
      throw new Error("This coupon has expired");
    }

    // 4. Check Total Usage Limit
    if (coupon.max_uses && coupon.uses_count >= coupon.max_uses) {
      throw new Error("This coupon is no longer available (limit reached)");
    }

    // 5. Check min order value
    if (cartTotal < coupon.min_order_value) {
      throw new Error(`Minimum order of ₹${coupon.min_order_value} required to use this coupon`);
    }

    // 6. Check user usage if logged in
    if (userId) {
      const { data: usage } = await supabase
        .from('user_coupons')
        .select('id')
        .eq('user_id', userId)
        .eq('coupon_id', coupon.id)
        .maybeSingle();

      if (usage) throw new Error("You have already used this promo code");
    }

    return coupon;
  },

  async trackUsage(couponId: string, userId: string, orderId: string) {
    const supabase = await createClient();

    // 1. Increment globally
    const { error: incError } = await supabase.rpc('increment_coupon_usage', { x: 1, row_id: couponId });
    
    // Fallback if RPC isn't available: manual update (less ideal for race conditions)
    if (incError) {
      await supabase.from('coupons').update({ 
        uses_count: supabase.rpc('increment', { value: 1 } as any) // Supabase doesn't have a direct increment without RPC usually
      } as any).eq('id', couponId);
    }

    // 2. Record user specific usage
    const { error: usageError } = await supabase
      .from('user_coupons')
      .insert({
        user_id: userId,
        coupon_id: couponId,
        order_id: orderId
      });

    if (usageError) throw usageError;
    return true;
  }
};
