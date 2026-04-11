import { Package, Users, ShoppingCart, TrendingUp, IndianRupee, Star, Sparkles, Clock } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export default async function AdminDashboardPage() {
    const supabase = await createClient();

    // Fetch basic stats
    const { data: rawRevenue } = await supabase
        .from('orders')
        .select('total_amount')
        .in('status', ['paid', 'processing', 'shipped', 'delivered']);

    const totalRevenue = rawRevenue?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

    const { count: activeOrdersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .in('status', ['paid', 'processing', 'shipped']);

    const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

    const { count: customersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_admin', false);
        
    const { data: recentOrders } = await supabase
        .from('orders')
        .select('id, customer_name, total_amount, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

    const { data: recentProducts } = await supabase
        .from('products')
        .select('id, name, stock, price, media_url')
        .order('created_at', { ascending: false })
        .limit(5);

    return (
        <div className="space-y-10 pb-20">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-black tracking-tighter text-gray-900 uppercase">
                    Maison <span className="text-brand-red font-serif lowercase underline decoration-brand-accent/30 decoration-8 underline-offset-4">Dashboard</span>
                </h1>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em] mt-1">Overseeing the legacy of Shri Jalaram Jewellers</p>
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Gross Revenue"
                    value={`₹${totalRevenue.toLocaleString('en-IN')}`}
                    subtitle="Lifetime Earnings"
                    icon={<IndianRupee className="h-5 w-5 text-brand-red" />}
                    variant="luxury"
                />
                <StatCard
                    title="Active Orders"
                    value={activeOrdersCount?.toString() || "0"}
                    subtitle="Pending Fulfillment"
                    icon={<ShoppingCart className="h-5 w-5 text-brand-red" />}
                />
                <StatCard
                    title="Total Masterpieces"
                    value={productsCount?.toString() || "0"}
                    subtitle="In the Catalog"
                    icon={<Package className="h-5 w-5 text-brand-red" />}
                />
                <StatCard
                    title="Total Patrons"
                    value={customersCount?.toString() || "0"}
                    subtitle="Registered Accounts"
                    icon={<Users className="h-5 w-5 text-brand-red" />}
                />
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">
                {/* Recent Orders */}
                <div className="lg:col-span-3 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Clock className="text-brand-red" size={20} />
                            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tighter">Recent Requests</h2>
                        </div>
                        <Link href="/admin/orders" className="text-[10px] font-black text-brand-red uppercase tracking-widest hover:underline underline-offset-4">View All</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-8 py-4 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">Patron</th>
                                    <th className="px-8 py-4 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-4 text-right text-[9px] font-black text-gray-400 uppercase tracking-widest">Investment</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {recentOrders?.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-8 py-5 text-sm font-bold text-gray-900">{order.customer_name}</td>
                                        <td className="px-8 py-5">
                                            <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-full bg-gray-50 text-gray-500 border border-gray-100 group-hover:bg-brand-red group-hover:text-white group-hover:border-brand-red transition-all">
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-sm text-gray-900 text-right font-black">₹{order.total_amount.toLocaleString()}</td>
                                    </tr>
                                )) || (
                                    <tr><td colSpan={3} className="py-20 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">The archives are still empty...</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recently Added Products */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Sparkles className="text-brand-accent" size={20} />
                            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tighter">Newest Vault</h2>
                        </div>
                        <Link href="/admin/products" className="text-[10px] font-black text-brand-accent uppercase tracking-widest hover:underline underline-offset-4">Browse All</Link>
                    </div>
                    <div className="p-8 space-y-6">
                        {recentProducts?.map((product) => (
                            <div key={product.id} className="flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                                        {product.media_url ? (
                                            <img src={product.media_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-200"><Package size={16} /></div>
                                        )}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-black text-gray-900 truncate leading-none capitalize">{product.name.toLowerCase()}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">₹{product.price.toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${product.stock > 10 ? 'bg-green-50 text-green-600' : product.stock > 0 ? 'bg-orange-50 text-orange-600' : 'bg-brand-red/5 text-brand-red'}`}>
                                    {product.stock} Units
                                </div>
                            </div>
                        )) || (
                            <div className="py-10 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Waiting for your first creation...</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

import Link from "next/link";

function StatCard({
    title, value, subtitle, icon, variant
}: {
    title: string; value: string; subtitle: string; icon: React.ReactNode; variant?: 'luxury'
}) {
    return (
        <div className={`relative overflow-hidden rounded-[2rem] border p-6 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 ${variant === 'luxury' ? 'bg-gray-900 border-gray-900' : 'bg-white border-gray-100'}`}>
            <div className="flex flex-col gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${variant === 'luxury' ? 'bg-brand-red shadow-lg shadow-brand-red/20' : 'bg-gray-50'}`}>
                    {icon}
                </div>
                <div>
                    <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${variant === 'luxury' ? 'text-gray-400' : 'text-gray-400'}`}>{title}</h3>
                    <div className="flex items-baseline gap-2">
                        <p className={`text-2xl font-black tracking-tighter ${variant === 'luxury' ? 'text-white' : 'text-gray-900'}`}>{value}</p>
                    </div>
                    <p className={`text-[9px] font-bold uppercase tracking-widest mt-2 ${variant === 'luxury' ? 'text-brand-accent' : 'text-brand-red'}`}>{subtitle}</p>
                </div>
            </div>
            
            {/* Background flourish */}
            <div className={`absolute -right-4 -bottom-4 opacity-5 pointer-events-none transform rotate-12`}>
                {icon}
            </div>
        </div>
    );
}
