"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createProductAction(formData: {
    name: string;
    price: number;
    description?: string | null;
    category?: string | null;
    category_id?: string | null;
    images?: File[];
    video?: File | null;
    variants?: string | null; 
    mrp?: number | null;
    badges?: string[];
    is_bestseller?: boolean;
    rating?: number;
    review_count?: number;
}) {
    try {
        const supabase = await createClient(true);

        let finalVideoUrl = null;
        let finalImageUrls: string[] = [];

        if (formData.video && formData.video.size > 0) {
            const file = formData.video;
            const fileExt = file.name.split('.').pop();
            const fileName = `vid_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('products')
                .upload(fileName, file, { cacheControl: '3600', upsert: false });

            if (uploadError) throw uploadError;
            const { data: urlData } = supabase.storage.from('products').getPublicUrl(fileName);
            finalVideoUrl = urlData.publicUrl;
        }

        if (formData.images && formData.images.length > 0) {
            for (const file of formData.images) {
                if (file.size > 0) {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `img_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
                    const { error: uploadError } = await supabase.storage
                        .from('products')
                        .upload(fileName, file, { cacheControl: '3600', upsert: false });
                    
                    if (uploadError) throw uploadError;
                    const { data: urlData } = supabase.storage.from('products').getPublicUrl(fileName);
                    finalImageUrls.push(urlData.publicUrl);
                }
            }
        }

        const mainMediaUrl = finalImageUrls.length > 0 ? finalImageUrls[0] : null;

        const { data: productData, error: dbError } = await supabase
            .from('products')
            .insert([{
                name: formData.name,
                slug: formData.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Math.random().toString(36).substring(7),
                price: formData.price,
                mrp: formData.mrp || null,
                description: formData.description || null,
                category_id: formData.category_id || null,
                media_url: mainMediaUrl,
                video_url: finalVideoUrl,
                stock: 100, // Default for now
                is_active: true,
                rating: formData.rating || 4.5,
                review_count: formData.review_count || 10,
                badges: formData.badges || [],
                is_bestseller: formData.is_bestseller || false
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
            const { error: imgError } = await supabase.from('product_images').insert(imageInserts);
            if (imgError) console.error("Error inserting multiple images:", imgError);
        }

        if (formData.variants) {
            try {
                const parsedVariants = JSON.parse(formData.variants);
                if (Array.isArray(parsedVariants) && parsedVariants.length > 0) {
                    const variantInserts = parsedVariants.map((v: any) => ({
                        product_id: productId,
                        color: v.color || null,
                        size: v.size || null,
                        stock: Number(v.stock) || 0,
                        sku: v.sku || null
                    }));
                    const { error: varError } = await supabase.from('product_variants').insert(variantInserts);
                    if (varError) console.error("Error inserting variants:", varError);
                }
            } catch (jsonErr) {}
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

export async function updateProductAction(id: string | number, formData: {
    name: string;
    price: number;
    mrp?: number | null;
    description?: string | null;
    category_id?: string | null;
    badges?: string[];
    is_bestseller?: boolean;
    rating?: number;
    review_count?: number;
    stock?: number;
}) {
    try {
        const supabase = await createClient(true);
        const { error } = await supabase
            .from('products')
            .update({
                name: formData.name,
                price: formData.price,
                mrp: formData.mrp || null,
                description: formData.description || null,
                category_id: formData.category_id || null,
                badges: formData.badges || [],
                is_bestseller: formData.is_bestseller || false,
                rating: formData.rating || 4.5,
                review_count: formData.review_count || 10,
                stock: formData.stock ?? 10
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
        const supabase = await createClient(true);
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) throw error;

        revalidatePath("/admin/products");
        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
