import { createClient } from "@/utils/supabase/client";
import { Product, Category, IProductService } from "@/types/product";
import { fallback } from "@/utils/data";

export class ProductService implements IProductService {
    private _supabase: any;

    constructor(client?: any) {
        this._supabase = client || createClient();
    }

    private get supabase() {
        return this._supabase;
    }
    async getProducts(limit: number = 64, offset: number = 0): Promise<Product[]> {
        try {
            const { data, error } = await this.supabase
                .from("products")
                .select("id, name, price, mrp, media_url, created_at, stock, is_bestseller, rating, categories(name)")
                .order("created_at", { ascending: false })
                .range(offset, offset + limit - 1);
            if (error) {
                console.error("Supabase Error (getProducts):", error);
            }
            console.log("Supabase Data Length:", data?.length || 0);
            if (error || !data || data.length === 0) {
                return this.mapSupabaseData([]); // Return empty set instead of legacy items if database is empty
            }
            return this.mapSupabaseData(data);
        } catch (e) {
            console.error("Catch Error (getProducts):", e);
            return [];
        }
    }

    async getProductById(id: string | number): Promise<Product | null> {
        try {
            const { data, error } = await this.supabase
                .from("products")
                .select("*, categories(name)")
                .eq("id", id)
                .single();
            if (error || !data) throw error;
            return this.mapSupabaseData([data])[0];
        } catch (e) {
            console.error("Catch Error (getProductById):", e);
            return null;
        }
    }

    async getTrendingProducts(limit: number = 8): Promise<Product[]> {
        try {
            const { data, error } = await this.supabase
                .from("products")
                .select("*, categories(name)")
                .eq("is_trending", true)
                .limit(limit);
            
            if (error || !data || data.length === 0) {
                // If no trending marked, just get top products
                const { data: fallbackData } = await this.supabase
                    .from("products")
                    .select("*, categories(name)")
                    .limit(limit);
                return this.mapSupabaseData(fallbackData || []);
            }
            return this.mapSupabaseData(data);
        } catch {
            return [];
        }
    }

    async getNewArrivals(limit: number = 8): Promise<Product[]> {
        try {
            const { data, error } = await this.supabase
                .from("products")
                .select("*, categories(name)")
                .order("created_at", { ascending: false })
                .limit(limit);
            
            if (error || !data) return [];
            return this.mapSupabaseData(data);
        } catch {
            return [];
        }
    }

    async getCategories(): Promise<Category[]> {
        try {
            // Fetch all categories for the admin panel and store
            const { data, error } = await this.supabase
                .from("categories")
                .select("id, name, slug")
                .order("name", { ascending: true });

            if (error || !data) {
                console.error("Error fetching categories:", error);
                return [];
            }

            return data.map((c: any) => ({
                id: c.id,
                name: c.name,
                slug: c.slug
            }));
        } catch (e) {
            console.error("Catch Error (getCategories):", e);
            return [];
        }
    }

    async createCategory(name: string, slug: string): Promise<Category | null> {
        try {
            const { data, error } = await this.supabase
                .from("categories")
                .insert([{ name, slug }])
                .select()
                .single();
            if (error || !data) return null;
            return data as Category;
        } catch {
            return null;
        }
    }

    async getRelatedProducts(excludeId: string | number, categoryId?: string | number): Promise<Product[]> {
        try {
            let query = this.supabase
                .from("products")
                .select("*, categories(name)")
                .neq("id", excludeId)
                .limit(4);
            
            if (categoryId) {
                query = query.eq("category_id", categoryId);
            }

            const { data, error } = await query;
            if (error || !data) return [];
            return this.mapSupabaseData(data);
        } catch (e) {
            console.error("Catch Error (getRelatedProducts):", e);
            return [];
        }
    }

    private mapSupabaseData(data: any[]): Product[] {
        return data.map(d => ({
            id: d.id,
            name: d.name,
            price: Number(d.price),
            mrp: d.mrp ? Number(d.mrp) : undefined,
            media_url: d.media_url || d.image_url || undefined,
            created_at: d.created_at || undefined,
            size: d.size || undefined,
            rating: d.rating || 4.5,
            review_count: d.review_count || 0,
            badges: d.badges || [],
            is_bestseller: d.is_bestseller || false,
            category_id: d.category_id || undefined,
            category_name: d.categories?.name || d.category || undefined,
            description: d.description || undefined,
            video_url: d.video_url || undefined,
            stock: d.stock || 0,
            variants: []
        }));
    }
}

// Singleton instance for client-side usage if needed, or instantiate per request on server.
export const productService = new ProductService();
