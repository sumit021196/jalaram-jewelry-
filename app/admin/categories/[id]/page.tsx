"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, Type, Link as LinkIcon, Image as ImageIcon, CheckCircle2, UploadCloud, Trash2, X } from "lucide-react";
import Link from "next/link";
import { createCategoryAction, updateCategoryAction, deleteCategoryAction } from "../category.actions";

export default function CategoryFormPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const isNew = resolvedParams.id === "new";

    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [isActive, setIsActive] = useState(true);

    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(!isNew);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isNew) {
            fetchCategory();
        }
    }, [isNew, resolvedParams.id]);

    const fetchCategory = async () => {
        try {
            const res = await fetch(`/api/categories/${resolvedParams.id}`);
            const data = await res.json();
            if (data.category) {
                setName(data.category.name);
                setSlug(data.category.slug);
                setImageUrl(data.category.image_url || "");
                setPreviewUrl(data.category.image_url || "");
                setIsActive(data.category.is_active);
            } else {
                setError("Category not found");
            }
        } catch (err: any) {
            setError(err.message || "Failed to load category");
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        if (isNew && name && !slug) {
            setSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
        }
    }, [name, isNew]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            let result;
            const data = {
                name,
                slug,
                image: imageFile,
                image_url: imageUrl,
                is_active: isActive
            };

            if (isNew) {
                result = await createCategoryAction(data);
            } else {
                result = await updateCategoryAction(resolvedParams.id, data);
            }

            if (!result.success) throw new Error(result.error);

            router.push("/admin/categories");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this category? All products in this category will become uncategorized.")) return;
        
        setIsDeleting(true);
        try {
            const result = await deleteCategoryAction(resolvedParams.id);
            if (!result.success) throw new Error(result.error);
            router.push("/admin/categories");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
            setIsDeleting(false);
        }
    };

    if (isFetching) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="animate-spin text-brand-red h-10 w-10" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading category details...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link 
                        href="/admin/categories" 
                        className="p-3 text-gray-400 hover:text-gray-900 bg-white border border-gray-100 rounded-2xl shadow-sm transition-all hover:scale-110 active:scale-95"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-gray-900 uppercase">
                            {isNew ? "Create Collection" : "Refine Collection"}
                        </h1>
                        <p className="mt-1 text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">
                            Curate your jewelry showcase
                        </p>
                    </div>
                </div>

                {!isNew && (
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="p-3 text-red-500 hover:text-white hover:bg-red-500 bg-white border border-gray-100 rounded-2xl shadow-sm transition-all hover:scale-110 active:scale-95 disabled:opacity-50"
                        title="Delete Category"
                    >
                        {isDeleting ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Form */}
                <div className="lg:col-span-2 space-y-8">
                    <form id="category-form" onSubmit={handleSave} className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-8">
                        {error && (
                            <div className="p-4 bg-brand-red/5 text-brand-red rounded-2xl text-[10px] font-black uppercase tracking-widest border border-brand-red/10 animate-in fade-in slide-in-from-top-2">
                                {error}
                            </div>
                        )}

                        <div className="space-y-6">
                            <div>
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">
                                    <Type size={14} className="text-brand-red" /> Collection Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-gray-50 rounded-2xl border-none px-6 py-4 text-gray-900 font-bold focus:ring-4 focus:ring-brand-red/5 outline-none transition-all placeholder:text-gray-300"
                                    placeholder="e.g. TEMPLE JEWELRY"
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">
                                    <LinkIcon size={14} className="text-brand-red" /> URL Slug
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                    className="w-full bg-gray-50 rounded-2xl border-none px-6 py-4 text-gray-900 font-bold focus:ring-4 focus:ring-brand-red/5 outline-none transition-all placeholder:text-gray-300"
                                    placeholder="e.g. temple-jewelry"
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">
                                    <ImageIcon size={14} className="text-brand-red" /> Display Visual
                                </label>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <label className="relative group cursor-pointer block">
                                        <div className="w-full h-32 bg-gray-50 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center gap-2 group-hover:bg-brand-red/5 group-hover:border-brand-red/20 transition-all overflow-hidden p-4 text-center">
                                            <UploadCloud className="text-gray-300 group-hover:text-brand-red transition-colors" size={24} />
                                            <div className="space-y-0.5">
                                                <p className="text-[10px] font-bold text-gray-800 uppercase tracking-widest">Upload Image</p>
                                                <p className="text-[8px] text-gray-400 uppercase font-medium">PNG, JPG up to 10MB</p>
                                            </div>
                                        </div>
                                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                    </label>

                                    <div className="space-y-2">
                                        <div className="relative">
                                            <input
                                                type="url"
                                                value={imageUrl}
                                                onChange={(e) => {
                                                    setImageUrl(e.target.value);
                                                    if (!imageFile) setPreviewUrl(e.target.value);
                                                }}
                                                className="w-full bg-gray-50 rounded-2xl border-none px-6 py-4 text-sm font-bold text-gray-900 focus:ring-4 focus:ring-brand-red/5 outline-none transition-all placeholder:text-gray-300"
                                                placeholder="Or paste direct image URL..."
                                            />
                                        </div>
                                        {imageFile && (
                                            <div className="flex items-center justify-between px-4 py-2 bg-brand-red/5 rounded-xl border border-brand-red/10">
                                                <span className="text-[10px] font-bold text-brand-red truncate max-w-[150px]">{imageFile.name}</span>
                                                <button onClick={() => { setImageFile(null); setPreviewUrl(imageUrl); }} className="text-brand-red hover:bg-brand-red/10 p-1 rounded-full">
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                             <div className="flex items-center gap-3">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer" 
                                        checked={isActive} 
                                        onChange={(e) => setIsActive(e.target.checked)} 
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                </label>
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">
                                    {isActive ? 'Live Status' : 'Draft View'}
                                </span>
                             </div>
                             <div className="flex items-center gap-2 text-[10px] font-black text-gray-300 uppercase italic">
                                <CheckCircle2 size={12} /> Ready to sync
                             </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full inline-flex items-center justify-center gap-3 rounded-2xl bg-brand-red px-8 py-5 text-xs font-black text-white shadow-xl shadow-brand-red/20 hover:bg-brand-red/90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all uppercase tracking-[0.2em]"
                            >
                                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <><Sparkles size={18} /> {isNew ? "Launch Collection" : "Update Collection"}</>}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Preview / Instructions */}
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <ImageIcon size={64} className="text-brand-red" />
                        </div>
                        
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 relative z-10">
                            Mobile Showcase Preview
                        </h4>
                        
                        <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 group shadow-lg">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-200">
                                    <ImageIcon size={48} strokeWidth={1} />
                                    <span className="text-[9px] font-black uppercase tracking-widest mt-2">No Visual Selected</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent flex items-end p-6">
                                <div>
                                    <span className="inline-block px-2 py-0.5 bg-brand-red text-white text-[8px] font-black uppercase rounded mb-2">NEW ARRIVAL</span>
                                    <h3 className="text-2xl font-black uppercase tracking-tighter text-white leading-tight">
                                        {name || "Collection Title"}
                                    </h3>
                                    <p className="text-[9px] font-bold text-white/50 uppercase tracking-[0.2em] mt-1">{slug || "url-path-here"}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-6 flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-dotted border-gray-200">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed">
                                This is how your category will appear in the main shop grid.
                            </p>
                        </div>
                    </div>

                    <div className="bg-black rounded-3xl p-8 border border-white/5 shadow-2xl space-y-4">
                        <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">
                            Luxury Standards
                        </h4>
                        <ul className="space-y-4">
                            {[
                                { title: "Visual Depth", desc: "Use high-resolution portrait images (4:5 ratio)." },
                                { title: "Bold Titles", desc: "Keep names short and impactful for mobile view." },
                                { title: "SEO Ready", desc: "Slugs are auto-generated for maximum searchability." }
                            ].map((tip, i) => (
                                <li key={i} className="space-y-1">
                                    <p className="text-[10px] font-black text-brand-accent uppercase tracking-widest">{tip.title}</p>
                                    <p className="text-[9px] font-medium text-gray-500 uppercase tracking-wide leading-relaxed">{tip.desc}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

const Sparkles = ({ size, className }: { size: number, className?: string }) => (
    <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
        <path d="m5 3 1 1"/><path d="m19 21 1 1"/><path d="m21 3-1 1"/><path d="m3 21 1-1"/>
    </svg>
);
