"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Plus, Pencil, Trash2, Loader2, Sparkles, TrendingUp, Star, AlertCircle } from "lucide-react";
import { Product } from "@/types/product";
import { deleteProductAction, updateProductAction } from "./add/product.actions";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/utils/cn";

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [updatingStock, setUpdatingStock] = useState<string | number | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const ITEMS_PER_PAGE = 20;

    const loadProducts = async (isInitial = true) => {
        if (isInitial) {
            setLoading(true);
            setError(null);
        }
        else setLoadingMore(true);

        try {
            const offset = isInitial ? 0 : products.length;
            const res = await fetch(`/api/products?limit=${ITEMS_PER_PAGE}&offset=${offset}&isAdmin=true`);
            const result = await res.json();

            if (!res.ok) throw new Error(result.error || "Failed to fetch products");
            const data = result.products || [];

            if (isInitial) {
                setProducts(data);
            } else {
                setProducts(prev => [...prev, ...data]);
            }

            setHasMore(data.length === ITEMS_PER_PAGE);
        } catch (err: any) {
            console.error("Failed to load products", err);
            setError(err.message || "Failed to fetch inventory. Ensure you have proper permissions.");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDelete = async (id: string | number) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        const result = await deleteProductAction(id);
        if (result.success) loadProducts();
        else alert(result.error);
    };

    const handleStockUpdate = async (product: Product, newStock: string) => {
        if (Number(newStock) === product.stock) return;
        setUpdatingStock(product.id);
        const result = await updateProductAction(product.id, {
            name: product.name,
            price: product.price,
            stock: Number(newStock)
        });
        if (result.success) {
            setProducts(prev => prev.map(p => p.id === product.id ? { ...p, stock: Number(newStock) } : p));
        }
        setUpdatingStock(null);
    };

    return (
        <div className="space-y-6 md:space-y-10 pb-20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl md:text-4xl font-black tracking-tighter text-gray-900 uppercase flex items-center gap-3">
                        <Package className="text-brand-red w-6 h-6 md:w-8 md:h-8" />
                        Inventory
                    </h1>
                    <p className="mt-1 text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-[0.3em]">
                        Manage your luxury catalog
                    </p>
                </div>

                <Link
                    href="/admin/products/add"
                    className="inline-flex items-center gap-3 px-6 md:px-8 py-3.5 md:py-4 bg-brand-red hover:bg-brand-red/90 text-white text-[10px] md:text-xs font-black rounded-xl md:rounded-2xl transition-all shadow-xl shadow-brand-red/20 active:scale-95 uppercase tracking-widest"
                >
                    <Plus size={16} />
                    New Creation
                </Link>
            </div>

            <div className="relative">
                <input
                    type="text"
                    placeholder="Search inventory..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-4 text-sm font-medium shadow-sm focus:ring-4 focus:ring-brand-red/5 focus:border-brand-red transition-all outline-none mb-6"
                />
            </div>

            <div className="bg-white rounded-3xl md:rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-16 md:p-32 gap-4">
                        <Loader2 className="animate-spin text-brand-red" size={32} />
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fetching Collection...</p>
                    </div>
                ) : error ? (
                    <div className="p-16 md:p-32 text-center">
                        <AlertCircle className="mx-auto w-12 h-12 text-brand-red mb-4" />
                        <p className="text-sm font-bold text-gray-900 uppercase tracking-widest">{error}</p>
                        <button onClick={() => loadProducts()} className="mt-4 text-[10px] font-black text-brand-red underline uppercase tracking-[0.2em]">Try Again</button>
                    </div>
                ) : products.length === 0 ? (
                    <div className="p-16 md:p-32 text-center">
                        <div className="mx-auto w-16 h-16 md:w-24 md:h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            <Package size={32} className="text-gray-200" />
                        </div>
                        <p className="text-lg md:text-xl font-black text-gray-900 uppercase tracking-tight">The Vault is Empty</p>
                        <p className="mt-2 text-[10px] md:text-sm text-gray-400 uppercase font-bold tracking-wide">Start by adding your first masterpiece.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-5 md:px-8 py-4 md:py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Product</th>
                                    <th className="px-5 md:px-8 py-4 md:py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                                    <th className="px-5 md:px-8 py-4 md:py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Pricing</th>
                                    <th className="px-5 md:px-8 py-4 md:py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Stock</th>
                                    <th className="px-5 md:px-8 py-4 md:py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-5 md:px-8 py-4 md:py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredProducts.map((product) => {
                                    const discount = product.mrp ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
                                    return (
                                        <tr key={product.id} className="group hover:bg-[#fdf2f4]/30 transition-all duration-300">
                                            <td className="px-5 md:px-8 py-4 md:py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative h-12 w-12 md:h-14 md:w-14 flex-shrink-0 rounded-xl md:rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
                                                        {product.media_url ? (
                                                            <img className="h-full w-full object-cover transition-transform group-hover:scale-110" src={product.media_url} alt={product.name} />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center text-gray-300">
                                                                <Package size={20} />
                                                            </div>
                                                        )}
                                                        {product.is_bestseller && (
                                                            <div className="absolute top-1 left-1 bg-brand-accent text-white p-0.5 rounded shadow-sm">
                                                                <TrendingUp size={10} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-900 leading-tight group-hover:text-brand-red transition-colors">{product.name}</div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <div className="flex text-brand-accent">
                                                                <Star size={10} fill="currentColor" />
                                                                <span className="text-[10px] font-black ml-1 text-gray-900">{product.rating || 4.5}</span>
                                                            </div>
                                                            <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest leading-none border-l pl-2 border-gray-100">ID: #{product.id.toString().slice(-4)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 md:px-8 py-4 md:py-6">
                                                <span className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg bg-gray-50 text-gray-500 border border-gray-100">
                                                    {product.category_name || "Loose"}
                                                </span>
                                            </td>
                                            <td className="px-5 md:px-8 py-4 md:py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-gray-900">₹{product.price.toLocaleString()}</span>
                                                    {product.mrp && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] text-gray-400 line-through">₹{product.mrp.toLocaleString()}</span>
                                                            <span className="text-[10px] font-black text-green-600">-{discount}% OFF</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-5 md:px-8 py-4 md:py-6">
                                                <div className="relative w-24">
                                                    <input 
                                                        type="number" 
                                                        defaultValue={product.stock || 0}
                                                        onBlur={(e) => handleStockUpdate(product, e.target.value)}
                                                        className={cn(
                                                            "w-full bg-gray-50 border-gray-100 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 focus:bg-white focus:ring-4 focus:ring-brand-red/5 focus:border-brand-red transition-all outline-none",
                                                            updatingStock === product.id && "bg-brand-red/5 animate-pulse"
                                                        )}
                                                    />
                                                    {updatingStock === product.id && (
                                                        <div className="absolute -right-6 top-1/2 -translate-y-1/2 text-brand-red">
                                                            <Loader2 size={12} className="animate-spin" />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-5 md:px-8 py-4 md:py-6">
                                                {product.stock && product.stock > 0 ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                                                        <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">In Stock</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-red shadow-[0_0_8px_rgba(130,26,46,0.5)]"></div>
                                                        <span className="text-[10px] font-black text-brand-red uppercase tracking-widest">Out of Vault</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-5 md:px-8 py-4 md:py-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link 
                                                        href={`/admin/products/${product.id}`}
                                                        className="p-3 text-gray-400 hover:text-brand-red rounded-xl hover:bg-white shadow-none hover:shadow-xl transition-all duration-300"
                                                    >
                                                        <Pencil size={16} />
                                                    </Link>
                                                    <button 
                                                        onClick={() => handleDelete(product.id)}
                                                        className="p-3 text-gray-400 hover:text-brand-red rounded-xl hover:bg-white shadow-none hover:shadow-xl transition-all duration-300"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {hasMore && !searchQuery && (
                            <div className="p-8 border-t border-gray-50 flex justify-center">
                                <button
                                    onClick={() => loadProducts(false)}
                                    disabled={loadingMore}
                                    className="px-8 py-3 bg-gray-50 hover:bg-gray-100 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
                                >
                                    {loadingMore ? <Loader2 size={14} className="animate-spin" /> : "Load More Assets"}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
