"use client";

import { useState, useEffect } from "react";
import { UploadCloud, CheckCircle2, ArrowLeft, Loader2, Plus, Trash2, Video } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createProductAction } from "./product.actions";
import { productService } from "@/services/product.service";
import { Category } from "@/types/product";

export default function AddProductPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCats = async () => {
            try {
                const data = await productService.getCategories();
                setCategories(data);
            } catch (err) { } finally { setLoading(false); }
        };
        loadCats();
    }, []);

    const handleCreate = async (data: any) => {
        const result = await createProductAction(data);
        return result;
    };

    if (loading) return (
        <div className="flex h-[60vh] items-center justify-center">
            <Loader2 className="animate-spin text-brand-red" size={40} />
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
                    New <span className="text-brand-red underline decoration-brand-accent/30 decoration-8 underline-offset-4 font-serif italic lowercase">Creation</span>
                </h1>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em] mt-1">Design your next masterpiece</p>
            </div>

            <ProductForm 
                categories={categories} 
                onSubmit={handleCreate} 
            />
        </div>
    );
}
    );
}
