"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createCategoryAction(formData: {
    name: string;
    slug: string;
    image?: File | null;
    is_active?: boolean;
}) {
    try {
        let supabase;
        try {
            supabase = await createClient(true);
        } catch (authErr: any) {
            return { success: false, error: `Authorization Setup Failed: ${authErr.message}. Please check your Netlify environment variables.` };
        }

        let finalImageUrl = null;

        const uploadWithRetry = async (fileName: string, buffer: Buffer, options: any, retries = 2) => {
            let lastError = null;
            for (let i = 0; i <= retries; i++) {
                const { data, error } = await supabase.storage.from('products').upload(fileName, buffer, options);
                if (!error) return { data, error: null };
                lastError = error;
                if (i < retries) await new Promise(res => setTimeout(res, 1000 * (i + 1)));
            }
            return { data: null, error: lastError };
        };

        if (formData.image && formData.image.size > 0) {
            const file = formData.image;
            const fileExt = file.name.split('.').pop() || 'jpg';
            const fileName = `cat_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

            // Convert File to Buffer for more reliable upload from server
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const { error: uploadError } = await uploadWithRetry(fileName, buffer, {
                cacheControl: '3600',
                upsert: true,
                contentType: file.type || 'image/jpeg'
            });

            if (uploadError) {
                console.error("FULL CATEGORY IMAGE UPLOAD ERROR:", JSON.stringify(uploadError, null, 2));
                throw new Error(`Category image upload failed: ${uploadError.message || 'Check logs'}`);
            }
            const { data: urlData } = supabase.storage.from('products').getPublicUrl(fileName);
            finalImageUrl = urlData.publicUrl;
        }

        const { data, error: dbError } = await supabase
            .from('categories')
            .insert([{
                name: formData.name,
                slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
                image_url: finalImageUrl,
                is_active: formData.is_active ?? true,
                display_order: 0
            }])
            .select()
            .single();

        if (dbError) throw dbError;

        revalidatePath("/admin/categories");
        revalidatePath("/");

        return { success: true, category: data };
    } catch (error: any) {
        console.error("Error creating category:", error);
        return { success: false, error: error.message };
    }
}

export async function updateCategoryAction(id: string, formData: {
    name: string;
    slug: string;
    image?: File | null;
    image_url?: string;
    is_active?: boolean;
}) {
    try {
        let supabase;
        try {
            supabase = await createClient(true);
        } catch (authErr: any) {
            return { success: false, error: `Authorization Setup Failed: ${authErr.message}. Please check your Netlify environment variables.` };
        }

        let updateData: any = {
            name: formData.name,
            slug: formData.slug,
            is_active: formData.is_active ?? true
        };

        const uploadWithRetry = async (fileName: string, buffer: Buffer, options: any, retries = 2) => {
            let lastError = null;
            for (let i = 0; i <= retries; i++) {
                const { data, error } = await supabase.storage.from('products').upload(fileName, buffer, options);
                if (!error) return { data, error: null };
                lastError = error;
                if (i < retries) await new Promise(res => setTimeout(res, 1000 * (i + 1)));
            }
            return { data: null, error: lastError };
        };

        if (formData.image && formData.image.size > 0) {
            const file = formData.image;
            const fileExt = file.name.split('.').pop() || 'jpg';
            const fileName = `cat_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

            // Convert File to Buffer for more reliable upload from server
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const { error: uploadError } = await uploadWithRetry(fileName, buffer, {
                cacheControl: '3600',
                upsert: true,
                contentType: file.type || 'image/jpeg'
            });

            if (uploadError) {
                console.error("Category Image Update Error Details:", {
                    message: uploadError.message,
                    name: uploadError.name,
                    status: (uploadError as any).status
                });
                throw new Error(`Category image update failed: ${uploadError.message}`);
            }
            const { data: urlData } = supabase.storage.from('products').getPublicUrl(fileName);
            updateData.image_url = urlData.publicUrl;
        } else if (formData.image_url !== undefined) {
            updateData.image_url = formData.image_url;
        }

        const { data, error } = await supabase
            .from('categories')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        revalidatePath("/admin/categories");
        revalidatePath(`/admin/categories/${id}`);
        revalidatePath("/");

        return { success: true, category: data };
    } catch (error: any) {
        console.error("Error updating category:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteCategoryAction(id: string) {
    try {
        const supabase = await createClient(true);
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (error) throw error;

        revalidatePath("/admin/categories");
        revalidatePath("/");
        
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting category:", error);
        return { success: false, error: error.message };
    }
}
