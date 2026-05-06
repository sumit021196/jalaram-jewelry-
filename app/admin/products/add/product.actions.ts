"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { productSchema } from "../product.schema";

export async function createProductAction(data: any) {
    try {
        const supabase = await createClient(); // Regular client to check session

        // Security check
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Unauthorized");

        const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
        if (!profile?.is_admin) throw new Error("Forbidden: Admin access required");

        const adminClient = await createClient(true); // Admin client for storage & DB bypass

        // Server-side validation
        const validated = productSchema.parse(data);

        let finalVideoUrl = null;
        let finalImageUrls: string[] = [];

        if (data.video && data.video.size > 0) {
            const file = data.video;
            const fileExt = file.name.split('.').pop();
            const fileName = `vid_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const { error: uploadError } = await adminClient.storage
                .from('products')
                .upload(fileName, file, { cacheControl: '3600', upsert: false });

            if (uploadError) throw uploadError;
            const { data: urlData } = adminClient.storage.from('products').getPublicUrl(fileName);
            finalVideoUrl = urlData.publicUrl;
        }

        if (data.images && data.images.length > 0) {
            for (const file of data.images) {
                if (file.size > 0) {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `img_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
                    const { error: uploadError } = await adminClient.storage
                        .from('products')
                        .upload(fileName, file, { cacheControl: '3600', upsert: false });
                    
                    if (uploadError) throw uploadError;
                    const { data: urlData } = adminClient.storage.from('products').getPublicUrl(fileName);
                    finalImageUrls.push(urlData.publicUrl);
                }
            }
        }

        const mainMediaUrl = finalImageUrls.length > 0 ? finalImageUrls[0] : null;

        const { data: productData, error: dbError } = await adminClient
            .from('products')
            .insert([{
                name: validated.name,
                slug: validated.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Math.random().toString(36).substring(7),
                price: validated.price,
                mrp: validated.mrp || null,
                description: validated.description || null,
                category_id: validated.category_id || null,
                media_url: mainMediaUrl,
                video_url: finalVideoUrl,
                stock: validated.stock,
                is_active: true,
                rating: validated.rating,
                review_count: validated.review_count,
                badges: validated.badges,
                is_bestseller: validated.is_bestseller
            }])
            .select()
            .single();

        if (dbError) throw dbError;
        const productId = productData.id;

        if (finalImageUrls.length > 0) {
            const imageInserts = finalImageUrls.map((url, idx) => ({
                product_id: productId,
                image_url: url,
                display_order: idx
            }));
            const { error: imgError } = await adminClient.from('product_images').insert(imageInserts);
            if (imgError) console.error("Error inserting multiple images:", imgError);
        }

        revalidatePath("/admin/products");
        revalidatePath("/");
        revalidatePath("/products");

        return { success: true };
    } catch (error: any) {
        console.error("Error creating product:", error);
        return { success: false, error: error.message };
    }
}

export async function updateProductAction(id: string | number, data: any) {
    try {
        const supabase = await createClient();

        // Security check
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Unauthorized");

        const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
        if (!profile?.is_admin) throw new Error("Forbidden: Admin access required");

        const adminClient = await createClient(true);

        // Server-side validation
        const validated = productSchema.parse(data);

        const { error } = await adminClient
            .from('products')
            .update({
                name: validated.name,
                price: validated.price,
                mrp: validated.mrp || null,
                description: validated.description || null,
                category_id: validated.category_id || null,
                badges: validated.badges,
                is_bestseller: validated.is_bestseller,
                rating: validated.rating,
                review_count: validated.review_count,
                stock: validated.stock
            })
            .eq('id', id);

        if (error) throw error;

        revalidatePath("/admin/products");
        revalidatePath(`/product/${id}`);
        revalidatePath("/");

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteProductAction(id: string | number) {
    try {
        const adminClient = await createClient(true);
        const { error } = await adminClient.from('products').delete().eq('id', id);
        if (error) throw error;

        revalidatePath("/admin/products");
        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
