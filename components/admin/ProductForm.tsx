"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UploadCloud, Loader2, Trash2, Video, Star, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { Category, Product } from "@/types/product";
import { cn } from "@/utils/cn";
import { productSchema, type ProductFormData } from "@/app/admin/products/product.schema";
import { toast } from "sonner";

const COMMON_BADGES = ['New Arrival', 'Best Seller', 'Trending', 'Limited Edition', 'Sale', 'Offer'];

interface ProductFormProps {
    initialData?: Product;
    categories: Category[];
    onSubmit: (formData: any) => Promise<{ success: boolean; error?: string }>;
    isEditing?: boolean;
}

export default function ProductForm({ initialData, categories, onSubmit, isEditing = false }: ProductFormProps) {
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState<{ file: File; url: string }[]>([]);
    const [video, setVideo] = useState<{ file: File; url: string } | null>(null);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors }
    } = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: initialData?.name || "",
            price: initialData?.price || 0,
            mrp: initialData?.mrp || null,
            description: initialData?.description || "",
            category_id: initialData?.category_id?.toString() || "",
            rating: initialData?.rating || 4.5,
            review_count: initialData?.review_count || 24,
            is_bestseller: initialData?.is_bestseller || false,
            badges: initialData?.badges || [],
            stock: initialData?.stock || 100,
        }
    });

    const selectedBadges = watch("badges");

    const toggleBadge = (badge: string) => {
        const current = selectedBadges;
        const updated = current.includes(badge)
            ? current.filter(b => b !== badge)
            : [...current, badge];
        setValue("badges", updated);
    };

    const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const newImages = files.map(file => ({
            file,
            url: URL.createObjectURL(file)
        }));
        setImages(prev => [...prev, ...newImages]);
    };

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setVideo({
                file,
                url: URL.createObjectURL(file)
            });
        }
    };

    const removeVideo = () => {
        if (video) {
            URL.revokeObjectURL(video.url);
            setVideo(null);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => {
            const newArr = [...prev];
            URL.revokeObjectURL(newArr[index].url);
            newArr.splice(index, 1);
            return newArr;
        });
    };

    const onFormSubmit = async (data: ProductFormData) => {
        setLoading(true);
        const toastId = toast.loading(isEditing ? "Updating product..." : "Launching product...");

        try {
            const result = await onSubmit({
                ...data,
                images: images.map(i => i.file),
                video: video?.file || null
            });

            if (!result.success) throw new Error(result.error);

            toast.success(isEditing ? "Product updated!" : "Product launched!", { id: toastId });

            if (!isEditing) {
                setTimeout(() => window.location.href = "/admin/products", 1500);
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to save product", { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Left Column: Details */}
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
                <div className="bg-white p-5 md:p-8 rounded-2xl md:rounded-[2rem] border border-gray-100 shadow-sm space-y-4 md:space-y-6">
                    <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                        <div className="w-10 h-10 bg-brand-red/10 rounded-xl flex items-center justify-center text-brand-red">
                            <Sparkles size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 uppercase tracking-tight">Essential Information</h2>
                    </div>

                    <div className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Product Title</label>
                                <input
                                    {...register("name")}
                                    className={cn(
                                        "w-full bg-gray-50 border-gray-100 rounded-xl md:rounded-2xl p-3.5 md:p-4 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-brand-red/5 focus:border-brand-red transition-all outline-none",
                                        errors.name && "border-red-500 ring-red-50"
                                    )}
                                    placeholder="e.g. Traditional Gold Temple Necklace"
                                />
                                {errors.name && <p className="mt-1 text-[10px] text-red-500 font-bold uppercase ml-1">{errors.name.message}</p>}
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Category</label>
                                <select
                                    {...register("category_id")}
                                    className={cn(
                                        "w-full bg-gray-50 border-gray-100 rounded-xl md:rounded-2xl p-3.5 md:p-4 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-brand-red/5 focus:border-brand-red transition-all outline-none appearance-none",
                                        errors.category_id && "border-red-500"
                                    )}
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                {errors.category_id && <p className="mt-1 text-[10px] text-red-500 font-bold uppercase ml-1">{errors.category_id.message}</p>}
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Stock Level</label>
                                <input
                                    type="number"
                                    {...register("stock")}
                                    className={cn(
                                        "w-full bg-gray-50 border-gray-100 rounded-xl md:rounded-2xl p-3.5 md:p-4 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-brand-red/5 focus:border-brand-red transition-all outline-none",
                                        errors.stock && "border-red-500"
                                    )}
                                />
                                {errors.stock && <p className="mt-1 text-[10px] text-red-500 font-bold uppercase ml-1">{errors.stock.message}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Description</label>
                            <textarea
                                {...register("description")}
                                rows={4}
                                className={cn(
                                    "w-full bg-gray-50 border-gray-100 rounded-xl md:rounded-2xl p-3.5 md:p-4 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-brand-red/5 focus:border-brand-red transition-all outline-none resize-none",
                                    errors.description && "border-red-500"
                                )}
                                placeholder="Describe the materials, plating, and design details..."
                            />
                            {errors.description && <p className="mt-1 text-[10px] text-red-500 font-bold uppercase ml-1">{errors.description.message}</p>}
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 md:p-8 rounded-2xl md:rounded-[2rem] border border-gray-100 shadow-sm space-y-4 md:space-y-6">
                    <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                        <div className="w-10 h-10 bg-brand-accent/10 rounded-xl flex items-center justify-center text-brand-accent">
                            <Star size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 uppercase tracking-tight">Pricing & Labels</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        <div className="lg:col-span-1">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Sale Price (₹)</label>
                            <input
                                type="number"
                                {...register("price")}
                                className={cn(
                                    "w-full bg-[#fdf2f4]/50 border-gray-100 rounded-xl md:rounded-2xl p-3.5 md:p-4 text-base font-bold text-brand-red focus:bg-white focus:ring-4 focus:ring-brand-red/5 transition-all outline-none",
                                    errors.price && "border-red-500"
                                )}
                            />
                            {errors.price && <p className="mt-1 text-[10px] text-red-500 font-bold uppercase ml-1">{errors.price.message}</p>}
                        </div>
                        <div className="lg:col-span-1">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">MRP Price (₹)</label>
                            <input
                                type="number"
                                {...register("mrp")}
                                className="w-full bg-gray-50 border-gray-100 rounded-xl md:rounded-2xl p-3.5 md:p-4 text-base font-medium text-gray-500 line-through focus:bg-white focus:ring-4 focus:ring-gray-200 transition-all outline-none"
                            />
                        </div>
                        <div className="lg:col-span-1">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Rating</label>
                            <input
                                type="number"
                                step="0.1"
                                max="5"
                                {...register("rating")}
                                className="w-full bg-gray-50 border-gray-100 rounded-xl md:rounded-2xl p-3.5 md:p-4 text-sm font-bold text-gray-900 focus:bg-white focus:ring-4 focus:ring-brand-accent/5 focus:border-brand-accent transition-all outline-none"
                            />
                        </div>
                        <div className="lg:col-span-1">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Reviews</label>
                            <input
                                type="number"
                                {...register("review_count")}
                                className="w-full bg-gray-50 border-gray-100 rounded-xl md:rounded-2xl p-3.5 md:p-4 text-sm font-bold text-gray-900 focus:bg-white focus:ring-4 focus:ring-brand-accent/5 transition-all outline-none"
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
                                        selectedBadges.includes(badge)
                                            ? "bg-brand-red text-white border-brand-red shadow-lg shadow-brand-red/20"
                                            : "bg-white text-gray-400 border-gray-100 hover:border-brand-red/30 hover:text-brand-red"
                                    )}
                                >
                                    {badge}
                                </button>
                            ))}
                        </div>
                        
                        <div className="flex items-center gap-3 mt-4 md:mt-6 p-3.5 md:p-4 bg-gray-50 rounded-xl md:rounded-2xl border border-gray-100 w-fit">
                            <input
                                type="checkbox"
                                id="is_bestseller"
                                {...register("is_bestseller")}
                                className="w-5 h-5 rounded-lg text-brand-red focus:ring-brand-red border-gray-300"
                            />
                            <label htmlFor="is_bestseller" className="text-xs font-bold text-gray-700 uppercase tracking-widest cursor-pointer">Mark as Bestseller</label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Media & Actions */}
            <div className="space-y-4 md:space-y-6">
                <div className="bg-white p-5 md:p-8 rounded-2xl md:rounded-[2rem] border border-gray-100 shadow-sm space-y-4 md:space-y-6">
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

                    <div className="pt-6 border-t border-gray-50 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Video Showcase</h3>
                            {video && (
                                <button 
                                    type="button" 
                                    onClick={removeVideo}
                                    className="text-[10px] font-bold text-brand-red uppercase tracking-widest hover:underline"
                                >
                                    Remove Video
                                </button>
                            )}
                        </div>
                        
                        {!video ? (
                            <div className="space-y-4">
                                <label className="relative group cursor-pointer block">
                                    <div className="w-full aspect-video bg-gray-50 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center gap-2 group-hover:bg-brand-accent/5 group-hover:border-brand-accent/20 transition-all overflow-hidden p-4 text-center">
                                        <Video className="text-gray-300 group-hover:text-brand-accent transition-colors" size={24} />
                                        <div className="space-y-0.5">
                                            <p className="text-[10px] font-bold text-gray-800 uppercase tracking-widest">Add Product Reel</p>
                                            <p className="text-[8px] text-gray-400 uppercase font-medium">MP4, WEBM up to 50MB</p>
                                        </div>
                                    </div>
                                    <input type="file" accept="video/*" onChange={handleVideoChange} className="hidden" />
                                </label>

                                {isEditing && initialData?.video_url && (
                                    <div className="relative aspect-video rounded-2xl overflow-hidden border border-gray-100 bg-black/5 flex items-center justify-center group">
                                        <video src={initialData.video_url} className="w-full h-full object-cover opacity-50" />
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 gap-2">
                                            <Video className="text-white/60" size={20} />
                                            <span className="text-white text-[9px] font-bold uppercase tracking-widest">Existing Video</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="relative aspect-video rounded-2xl overflow-hidden border border-gray-100 bg-black group shadow-lg">
                                <video 
                                    src={video.url} 
                                    autoPlay 
                                    muted 
                                    loop 
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-brand-red rounded-lg text-white">
                                            <Video size={12} />
                                        </div>
                                        <span className="text-[9px] font-black text-white uppercase tracking-widest">Live Preview</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white p-5 md:p-8 rounded-2xl md:rounded-[2rem] border border-gray-100 shadow-sm space-y-4 md:space-y-6">
                    <button
                        type="submit"
                        disabled={loading}
                        className={cn(
                            "w-full py-4 md:py-5 rounded-xl md:rounded-[1.25rem] font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-3",
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
                </div>
            </div>
        </form>
    );
}
