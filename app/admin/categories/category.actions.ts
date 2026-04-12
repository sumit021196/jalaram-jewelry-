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
        const supabase = await createClient(true);

        let finalImageUrl = null;

        if (formData.image && formData.image.size > 0) {
            const file = formData.image;
            const fileExt = file.name.split('.').pop() || 'jpg';
            const fileName = `cat_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('products') // Using products bucket as it exists and is configured
                .upload(fileName, file, { cacheControl: '3600', upsert: false });

            if (uploadError) throw uploadError;
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
        const supabase = await createClient(true);

        let updateData: any = {
            name: formData.name,
            slug: formData.slug,
            is_active: formData.is_active ?? true
        };

        if (formData.image && formData.image.size > 0) {
            const file = formData.image;
            const fileExt = file.name.split('.').pop() || 'jpg';
            const fileName = `cat_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('products')
                .upload(fileName, file, { cacheControl: '3600', upsert: false });

            if (uploadError) throw uploadError;
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
