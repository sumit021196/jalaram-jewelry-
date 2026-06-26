import { AdminSidebar } from "@/components/admin/Sidebar";
import { ReactNode } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: ReactNode }) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

    if (!profile?.is_admin) {
        redirect("/");
    }


    return (
        <div className="flex min-h-screen md:h-screen bg-[#fdf2f4]/30 md:overflow-hidden font-sans text-gray-900">
            <AdminSidebar />

            {/* Mobile Top Bar */}
            <div className="md:hidden fixed top-0 inset-x-0 h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 z-[70] flex items-center justify-center px-4">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-brand-red flex items-center justify-center text-white font-black text-xl shadow-lg">J</div>
                    <span className="text-sm font-bold uppercase tracking-widest">Jalaram <span className="text-brand-red">Admin</span></span>
                </Link>
            </div>

            <main className="flex-1 overflow-x-hidden overflow-y-auto w-full transition-all duration-300 md:ml-64 pt-16 md:pt-0">
                <div className="p-4 md:p-10 lg:p-12 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
