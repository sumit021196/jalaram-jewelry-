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
        let supabase;
        try {
            supabase = await createClient(true);
        } catch (authErr: any) {
            return { success: false, error: `Authorization Setup Failed: ${authErr.message}. Please check your Netlify environment variables.` };
        }

        let finalVideoUrl = null;
        let finalImageUrls: string[] = [];

        const uploadWithRetry = async (fileName: string, buffer: Buffer, options: any, retries = 2) => {
            let lastError = null;
            for (let i = 0; i <= retries; i++) {
                // Ensure buffer is actually a Buffer and has length
                if (!buffer || buffer.length === 0) {
                    return { data: null, error: { message: "Empty buffer provided for upload", name: "EmptyPayloadError" } };
                }

                const { data, error } = await supabase.storage.from('products').upload(fileName, buffer, {
                    ...options,
                    // duplex: 'half' // Sometimes required for Node 18+ streams, though upload() handles it
                });

                if (!error) return { data, error: null };
                lastError = error;

                // If it's a 400 Bad Request, retrying might not help if it's malformed, but let's try once more just in case of transient issues
                console.warn(`Upload attempt ${i + 1} failed:`, error.message);

                if (i < retries) await new Promise(res => setTimeout(res, 1000 * (i + 1)));
            }
            return { data: null, error: lastError };
        };

        if (formData.video && formData.video.size > 0) {
            const file = formData.video;
            const fileExt = file.name.split('.').pop();
            const fileName = `vid_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

            // Convert File to Buffer for more reliable upload from server
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const { error: uploadError } = await uploadWithRetry(fileName, buffer, {
                cacheControl: '3600',
                upsert: true,
                contentType: file.type || 'video/mp4'
            });

            if (uploadError) {
                console.error("Video Upload Error Details:", {
                    message: uploadError.message,
                    name: uploadError.name,
                    status: (uploadError as any).status
                });
                throw new Error(`Video upload failed: ${uploadError.message}`);
            }
            const { data: urlData } = supabase.storage.from('products').getPublicUrl(fileName);
            finalVideoUrl = urlData.publicUrl;
        }

        if (formData.images && formData.images.length > 0) {
            for (const file of formData.images) {
                if (file.size > 0) {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `img_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

                    // Convert File to Buffer for more reliable upload from server
                    const arrayBuffer = await file.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);

                    const { error: uploadError, data: uploadData } = await uploadWithRetry(fileName, buffer, {
                        cacheControl: '3600',
                        upsert: true,
                        contentType: file.type || 'image/jpeg'
                    });

                    if (uploadError) {
                        // Log full error details to help diagnose 400 Bad Request
                        console.error("FULL IMAGE UPLOAD ERROR:", JSON.stringify(uploadError, null, 2));
                        console.error("Payload info:", {
                            fileName,
                            bufferSize: buffer.length,
                            contentType: file.type || 'image/jpeg'
                        });
                        throw new Error(`Image upload failed: ${uploadError.message || 'Check logs for details'}`);
                    }
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
