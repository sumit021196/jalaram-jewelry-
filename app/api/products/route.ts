import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '20', 10);
        const offset = parseInt(searchParams.get('offset') || '0', 10);
        const isAdminParam = searchParams.get('isAdmin') === 'true';
        let isAdmin = false;

        // Verify session for admin access
        const supabaseAuth = await createClient(false);
        const { data: { user } } = await supabaseAuth.auth.getUser();

        if (isAdminParam && user) {
            const { data: profile } = await supabaseAuth.from('profiles').select('is_admin').eq('id', user.id).single();
            if (profile?.is_admin) {
                isAdmin = true;
            }
        }

        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SERVICE_ROLE_KEY;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (isAdminParam && !isAdmin) {
            return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
        }

        if (isAdmin && (!serviceKey || serviceKey === "dummy_service_key" || serviceKey === supabaseKey)) {
             return NextResponse.json({
                 error: "CONFIGURATION ERROR: Admin access requires SUPABASE_SERVICE_ROLE_KEY to be set in environment variables."
             }, { status: 403 });
        }

        const supabase = await createClient(isAdmin);
        const { data, error } = await supabase
            .from("products")
            .select("id, name, price, mrp, media_url, created_at, stock, is_bestseller, rating, categories(name)")
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;
        return NextResponse.json({ products: data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        
        // Ensure user is admin
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
        if (!profile?.is_admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const body = await req.json();
        const { name, slug, description, price, stock, category_id, media_url, is_active, is_trending } = body;

        const { data, error } = await supabase
            .from('products')
            .insert([{ 
                name, 
                slug, 
                description, 
                price: parseFloat(price), 
                stock: parseInt(stock, 10), 
                category_id: category_id || null, 
                media_url, 
                is_active, 
                is_trending 
            }])
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json({ product: data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
