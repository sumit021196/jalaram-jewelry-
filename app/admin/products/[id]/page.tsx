"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Category, Product } from "@/types/product";
import { productService } from "@/services/productService";
import { updateProductAction } from "../add/product.actions";
import ProductForm from "@/components/admin/ProductForm";

export default function EditProductPage() {
    const { id } = useParams();
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [prodData, catData] = await Promise.all([
                    productService.getProductById(id as string),
                    productService.getCategories()
                ]);
                setProduct(prodData);
                setCategories(catData);
            } catch (err) {
                console.error("Failed to load product data", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    const handleUpdate = async (formData: any) => {
        const result = await updateProductAction(id as string, formData);
        return result;
    };

    if (loading) return (
        <div className="flex h-[60vh] items-center justify-center">
            <Loader2 className="animate-spin text-brand-red" size={40} />
        </div>
    );

    if (!product) return (
        <div className="max-w-6xl mx-auto py-20 text-center">
            <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-widest">Product not found</h1>
            <Link href="/admin/products" className="mt-4 text-brand-red uppercase font-black text-xs border-b border-brand-red">Back to Inventory</Link>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-20">
            <div className="flex flex-col gap-2">
                <Link href="/admin/products" className="flex items-center gap-2 text-[10px] font-bold text-gray-400 hover:text-brand-red uppercase tracking-[0.2em] w-fit transition-colors">
                    <ArrowLeft size={14} />
                    Back to Inventory
                </Link>
                <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter mt-4">
                    Modify <span className="text-brand-red underline decoration-brand-accent/30 decoration-8 underline-offset-4 font-serif italic lowercase">Collection</span>
                </h1>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em] mt-1">Refining excellence for {product.name}</p>
            </div>

            <ProductForm 
                initialData={product}
                categories={categories} 
                onSubmit={handleUpdate} 
                isEditing={true}
            />
        </div>
    );
}
