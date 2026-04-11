"use client";

import { useState, useEffect } from "react";
import { UploadCloud, CheckCircle2, ArrowLeft, Loader2, Plus, Trash2, Video, Star, Sparkles } from "lucide-react";
import { Category, Product } from "@/types/product";
import { cn } from "@/utils/cn";
import { FALLBACK_IMG } from "@/utils/images";

const COMMON_BADGES = ['New Arrival', 'Best Seller', 'Trending', 'Limited Edition', 'Sale', 'Offer'];

interface ProductFormProps {
    initialData?: Product;
    categories: Category[];
    onSubmit: (formData: any) => Promise<{ success: boolean; error?: string }>;
    isEditing?: boolean;
}

export default function ProductForm({ initialData, categories, onSubmit, isEditing = false }: ProductFormProps) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        price: initialData?.price?.toString() || "",
        mrp: initialData?.mrp?.toString() || "",
        description: initialData?.description || "",
        category_id: initialData?.category_id || "",
        rating: initialData?.rating?.toString() || "4.5",
        review_count: initialData?.review_count?.toString() || "24",
        is_bestseller: initialData?.is_bestseller || false,
        badges: initialData?.badges || [] as string[],
        stock: initialData?.stock?.toString() || "100",
    });

    const [images, setImages] = useState<{ file: File; url: string }[]>([]);
    const [video, setVideo] = useState<{ file: File; url: string } | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const toggleBadge = (badge: string) => {
        setFormData(prev => ({
            ...prev,
            badges: prev.badges.includes(badge)
                ? prev.badges.filter(b => b !== badge)
                : [...prev.badges, badge]
        }));
    };

    const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const newImages = files.map(file => ({
            file,
            url: URL.createObjectURL(file)
        }));
        setImages(prev => [...prev, ...newImages]);
    };

    const removeImage = (index: number) => {
        setImages(prev => {
            const newArr = [...prev];
            URL.revokeObjectURL(newArr[index].url);
            newArr.splice(index, 1);
            return newArr;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const result = await onSubmit({
                ...formData,
                price: Number(formData.price),
                mrp: formData.mrp ? Number(formData.mrp) : null,
                rating: Number(formData.rating),
                review_count: Number(formData.review_count),
                stock: Number(formData.stock),
                images: images.map(i => i.file),
                video: video?.file || null
            });

            if (!result.success) throw new Error(result.error);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || "Failed to save product");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Details */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                        <div className="w-10 h-10 bg-brand-red/10 rounded-xl flex items-center justify-center text-brand-red">
                            <Sparkles size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 uppercase tracking-tight">Essential Information</h2>
                    </div>

                    <div className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Product Title</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-50 border-gray-100 rounded-2xl p-4 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-brand-red/5 focus:border-brand-red transition-all outline-none"
                                    placeholder="e.g. Traditional Gold Temple Necklace"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Category</label>
                                <select
                                    name="category_id"
                                    value={formData.category_id}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-50 border-gray-100 rounded-2xl p-4 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-brand-red/5 focus:border-brand-red transition-all outline-none appearance-none"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Stock Level</label>
                                <input
                                    type="number"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-50 border-gray-100 rounded-2xl p-4 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-brand-red/5 focus:border-brand-red transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Description</label>
                            <textarea
                                name="description"
                                rows={4}
                                value={formData.description}
                                onChange={handleInputChange}
                                className="w-full bg-gray-50 border-gray-100 rounded-2xl p-4 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-brand-red/5 focus:border-brand-red transition-all outline-none resize-none"
                                placeholder="Describe the materials, plating, and design details..."
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                        <div className="w-10 h-10 bg-brand-accent/10 rounded-xl flex items-center justify-center text-brand-accent">
                            <Star size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 uppercase tracking-tight">Pricing & Labels</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="lg:col-span-1">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Sale Price (₹)</label>
                            <input
                                type="number"
                                name="price"
                                required
                                value={formData.price}
                                onChange={handleInputChange}
                                className="w-full bg-[#fdf2f4]/50 border-gray-100 rounded-2xl p-4 text-base font-bold text-brand-red focus:bg-white focus:ring-4 focus:ring-brand-red/5 transition-all outline-none"
                            />
                        </div>
                        <div className="lg:col-span-1">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">MRP Price (₹)</label>
                            <input
                                type="number"
                                name="mrp"
                                value={formData.mrp}
                                onChange={handleInputChange}
                                className="w-full bg-gray-50 border-gray-100 rounded-2xl p-4 text-base font-medium text-gray-500 line-through focus:bg-white focus:ring-4 focus:ring-gray-200 transition-all outline-none"
                            />
                        </div>
                        <div className="lg:col-span-1">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Rating</label>
                            <input
                                type="number"
                                name="rating"
                                step="0.1"
                                max="5"
                                value={formData.rating}
                                onChange={handleInputChange}
                                className="w-full bg-gray-50 border-gray-100 rounded-2xl p-4 text-sm font-bold text-gray-900 focus:bg-white focus:ring-4 focus:ring-brand-accent/5 focus:border-brand-accent transition-all outline-none"
                            />
                        </div>
                        <div className="lg:col-span-1">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Reviews</label>
                            <input
                                type="number"
                                name="review_count"
                                value={formData.review_count}
                                onChange={handleInputChange}
                                className="w-full bg-gray-50 border-gray-100 rounded-2xl p-4 text-sm font-bold text-gray-900 focus:bg-white focus:ring-4 focus:ring-brand-accent/5 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="pt-4 space-y-4">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Product Badges</label>
                        <div className="flex flex-wrap gap-2">
                            {COMMON_BADGES.map(badge => (
                                <button
                                    key={badge}
                                    type="button"
                                    onClick={() => toggleBadge(badge)}
                                    className={cn(
                                        "px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all border",
                                        formData.badges.includes(badge)
                                            ? "bg-brand-red text-white border-brand-red shadow-lg shadow-brand-red/20"
                                            : "bg-white text-gray-400 border-gray-100 hover:border-brand-red/30 hover:text-brand-red"
                                    )}
                                >
                                    {badge}
                                </button>
                            ))}
                        </div>
                        
                        <div className="flex items-center gap-3 mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-100 w-fit">
                            <input
                                type="checkbox"
                                name="is_bestseller"
                                id="is_bestseller"
                                checked={formData.is_bestseller}
                                onChange={handleInputChange}
                                className="w-5 h-5 rounded-lg text-brand-red focus:ring-brand-red border-gray-300"
                            />
                            <label htmlFor="is_bestseller" className="text-xs font-bold text-gray-700 uppercase tracking-widest cursor-pointer">Mark as Bestseller</label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Media & Actions */}
            <div className="space-y-6">
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                        <div className="w-10 h-10 bg-brand-accent/10 rounded-xl flex items-center justify-center text-brand-accent">
                            <UploadCloud size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 uppercase tracking-tight">Gallery</h2>
                    </div>

                    <div className="space-y-4">
                        <label className="relative group cursor-pointer block">
                            <div className="w-full aspect-[4/3] bg-gray-50 border-2 border-dashed border-gray-100 rounded-[1.5rem] flex flex-col items-center justify-center gap-3 group-hover:bg-brand-red/5 group-hover:border-brand-red/20 transition-all overflow-hidden p-6 text-center">
                                <UploadCloud className="text-gray-300 group-hover:text-brand-red transition-colors" size={32} />
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-gray-800 uppercase tracking-widest">Upload Images</p>
                                    <p className="text-[10px] text-gray-400 uppercase font-medium">PNG, JPG up to 10MB</p>
                                </div>
                            </div>
                            <input type="file" multiple accept="image/*" onChange={handleImagesChange} className="hidden" />
                        </label>

                        {images.length > 0 && (
                            <div className="grid grid-cols-2 gap-3">
                                {images.map((img, idx) => (
                                    <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group border border-gray-100">
                                        <img src={img.url} className="w-full h-full object-cover" alt="" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(idx)}
                                            className="absolute inset-0 bg-brand-red/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                        {idx === 0 && (
                                            <span className="absolute top-2 left-2 px-2 py-0.5 bg-brand-accent text-white text-[8px] font-black uppercase rounded shadow-sm">Main</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {isEditing && !images.length && initialData?.media_url && (
                             <div className="relative aspect-square rounded-2xl overflow-hidden border border-gray-100 opacity-50 grayscale transition-all hover:opacity-100 hover:grayscale-0">
                                <img src={initialData.media_url} className="w-full h-full object-cover" alt="" />
                                <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-[10px] font-bold uppercase tracking-widest">Existing Image</span>
                             </div>
                        )}
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
                    {error && (
                        <div className="p-4 bg-brand-red/5 border border-brand-red/10 rounded-2xl text-brand-red text-xs font-bold uppercase tracking-wide">
                            {error}
                        </div>
                    )}

                    {success ? (
                        <div className="flex flex-col items-center justify-center gap-4 py-6 animate-in zoom-in duration-500">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                <CheckCircle2 size={32} />
                            </div>
                            <p className="text-sm font-bold text-gray-900 uppercase tracking-widest">Saved Successfully!</p>
                            <button
                                type="button"
                                onClick={() => window.location.href = "/admin/products"}
                                className="text-xs font-bold text-brand-red uppercase tracking-widest border-b border-brand-red pb-1"
                            >
                                Back to Inventory
                            </button>
                        </div>
                    ) : (
                        <button
                            type="submit"
                            disabled={loading}
                            className={cn(
                                "w-full py-5 rounded-[1.25rem] font-bold text-xs uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-3",
                                loading
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-brand-red text-white hover:bg-brand-red/90 hover:scale-[1.02] active:scale-[0.98] shadow-brand-red/20"
                            )}
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : (
                                <>
                                    <Sparkles size={18} />
                                    {isEditing ? 'Update Selection' : 'Launch Product'}
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </form>
    );
}
