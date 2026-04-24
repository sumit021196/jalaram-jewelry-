import { NextResponse } from "next/server";
import { couponService } from "@/services/coupon.service";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
    try {
        const { code, cartTotal } = await req.json();
        
        if (!code) {
            return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        // Use the robust server-side validation logic
        const coupon = await couponService.validateCoupon(code, user?.id, cartTotal);

        return NextResponse.json({ 
            success: true, 
            coupon: coupon
        });

    } catch (err: any) {
        return NextResponse.json({ 
            success: false, 
            error: err.message || "Failed to validate coupon" 
        }, { status: 400 });
    }
}
