import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Plus, Pencil, Trash2, Image as ImageIcon, LayoutGrid, Sparkles } from "lucide-react";
import AdminImage from "@/components/admin/AdminImage";

const cn = (...classes: string[]) => classes.filter(Boolean).join(' ');

export default async function AdminCategoriesPage() {
    const supabase = await createClient();
    const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-10 pb-20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-gray-900 uppercase flex items-center gap-3">
                        <LayoutGrid className="text-brand-red" size={32} />
                        Collections
                    </h1>
                    <p className="mt-1 text-xs font-bold text-gray-400 uppercase tracking-[0.3em]">
                        Organize your artistic jewelry
                    </p>
                </div>
                <Link
                    href="/admin/categories/new"
                    className="inline-flex items-center gap-3 px-8 py-4 bg-brand-red hover:bg-brand-red/90 text-white text-xs font-black rounded-2xl transition-all shadow-xl shadow-brand-red/20 active:scale-95 uppercase tracking-widest"
                >
                    <Plus size={20} />
                    New Category
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {categories?.map((category) => (
                    <div key={category.id} className="group relative bg-white rounded-[2rem] border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                        <div className="aspect-[4/5] bg-gray-50 relative overflow-hidden">
                            {category.image_url ? (
                                <AdminImage 
                                    src={category.image_url} 
                                    alt={category.name} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-200 bg-gradient-to-br from-gray-50 to-gray-100">
                                    <ImageIcon size={48} strokeWidth={1} />
                                    <span className="text-[10px] font-black uppercase tracking-widest mt-2">No Visual</span>
                                </div>
                            )}
                            
                            {/* Gradient Overlay */}
                            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-8">
                                <span className={cn(
                                    "w-fit px-3 py-1 mb-3 text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg",
                                    category.is_active ? "bg-green-500 text-white" : "bg-brand-red text-white"
                                )}>
                                    {category.is_active ? 'Active' : 'Private'}
                                </span>
                                <h3 className="text-2xl font-black uppercase tracking-tighter text-white leading-none group-hover:text-brand-accent transition-colors">
                                    {category.name}
                                </h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <Sparkles size={10} className="text-brand-accent" />
                                    <p className="text-[9px] font-bold text-white/50 uppercase tracking-[0.2em]">{category.slug}</p>
                                </div>
                            </div>

                            {/* Floating Actions */}
                            <div className="absolute top-6 right-6 flex flex-col gap-2 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
                                <Link 
                                    href={`/admin/categories/${category.id}`} 
                                    className="p-3 bg-white/90 backdrop-blur-md text-gray-900 hover:bg-brand-red hover:text-white rounded-2xl shadow-2xl transition-all hover:scale-110 active:scale-95"
                                >
                                    <Pencil size={18} />
                                </Link>
                                <button
                                    className="p-3 bg-white/90 backdrop-blur-md text-gray-900 hover:bg-brand-red hover:text-white rounded-2xl shadow-2xl transition-all hover:scale-110 active:scale-95"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                
                {(!categories || categories.length === 0) && (
                   <div className="col-span-full bg-white rounded-[3rem] border border-dashed border-gray-200 p-32 text-center">
                        <div className="mx-auto w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            <LayoutGrid className="text-gray-200" size={48} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 uppercase">Start organizing</h3>
                        <p className="text-sm font-medium text-gray-400 mt-2 max-w-sm mx-auto uppercase tracking-wide">Create your first category to group related products.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
