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
    async getProducts(): Promise<Product[]> {
        try {
            const { data, error } = await this.supabase
                .from("products")
                .select("*, categories(name)")
                .limit(64);
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

    async getTrendingProducts(): Promise<Product[]> {
        const products = await this.getProducts();
        // Simulate trending logic safely using mock/fallback for now if needed.
        // Assuming fallback data has trending items (mock logic)
        return products.slice(0, 8); // Simplification for UI focus
    }

    async getNewArrivals(): Promise<Product[]> {
        const products = await this.getProducts();
        return [...products]
            .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
            .slice(0, 8);
    }

    async getCategories(): Promise<Category[]> {
        try {
            // Fetch categories that have at least one product
            const { data, error } = await this.supabase
                .from("categories")
                .select("id, name, slug")
                .not("id", "is", null); // Placeholder for logic "at least one product" if needed via join, but simple fetch for now

            // More accurate: categories JOIN products
            const { data: catWithProds, error: joinError } = await this.supabase
                .from("categories")
                .select("id, name, slug, products!inner(id)");

            if (joinError || !catWithProds) return [];

            // Remove duplicates
            const uniqueCats = Array.from(new Map<string, any>(catWithProds.map((c: any) => [c.id, c])).values());

            return uniqueCats.map((c: any) => ({
                id: c.id,
                name: c.name,
                slug: c.slug
            }));
        } catch {
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
            price: d.price,
            media_url: d.media_url || d.image_url || undefined,
            created_at: d.created_at || undefined,
            size: d.size || undefined,
            rating: d.rating || 4.5,
            category_id: d.category_id || undefined,
            category_name: d.categories?.name || d.category || undefined,
            description: d.description || undefined,
            variants: []
        }));
    }
}

// Singleton instance for client-side usage if needed, or instantiate per request on server.
export const productService = new ProductService();
