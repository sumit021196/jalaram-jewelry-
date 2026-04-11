"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    LogOut,
    Menu,
    X,
    List,
    Star,
    Image as ImageIcon,
    Settings,
    UploadCloud,
    Ticket
} from "lucide-react";
import { cn } from "@/utils/cn";
import { useState } from "react";
import { logout } from "@/app/(auth)/auth.actions";
import { useRouter } from "next/navigation";

const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Categories", href: "/admin/categories", icon: List },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Reviews", href: "/admin/reviews", icon: Star },
    { name: "Customers", href: "/admin/users", icon: Users },
    { name: "Banners", href: "/admin/banners", icon: ImageIcon },
    { name: "Media", href: "/admin/media", icon: UploadCloud },
    { name: "Coupons", href: "/admin/coupons", icon: Ticket },
    { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile Menu Toggle */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-4 left-4 z-[100] p-3 bg-white rounded-2xl shadow-xl border border-gray-100 md:hidden hover:scale-105 active:scale-95 transition-all"
                aria-label="Toggle Menu"
            >
                {isOpen ? <X size={20} className="text-brand-red" /> : <Menu size={20} className="text-gray-900" />}
            </button>

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-[90] w-64 bg-white border-r shadow-2xl border-gray-100 transform transition-transform duration-500 ease-in-out md:translate-x-0",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex flex-col h-full">
                    <div className="h-20 flex items-center px-6 border-b border-gray-100 bg-[#fdf2f4]/50">
                        <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-brand-red flex items-center justify-center text-white font-black text-xl shadow-lg">J</div>
                            <h1 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-900">
                                Jalaram <span className="text-brand-red">Admin</span>
                            </h1>
                        </Link>
                    </div>

                    <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            // Exact match for dashboard home, startsWith for others
                            const active = item.href === '/admin' ? pathname === item.href : pathname.startsWith(item.href);

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group",
                                        active
                                            ? "bg-brand-red text-white shadow-xl shadow-brand-red/20 translate-x-1"
                                            : "text-gray-500 hover:bg-[#fdf2f4] hover:text-brand-red"
                                    )}
                                >
                                    <Icon
                                        size={20}
                                        className={cn(
                                            "transition-transform group-hover:scale-110",
                                            active ? "text-white" : "text-gray-400 group-hover:text-brand-red"
                                        )}
                                    />
                                    <span className={cn("text-xs font-bold uppercase tracking-widest", active ? "opacity-100" : "opacity-80")}>
                                        {item.name}
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-4 border-t border-gray-100">
                        <button 
                            onClick={async () => {
                                await logout();
                                router.push("/");
                            }}
                            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-gray-400 hover:bg-brand-red/5 hover:text-brand-red transition-all group"
                        >
                            <LogOut size={20} className="transition-transform group-hover:rotate-12" />
                            <span className="text-xs font-bold uppercase tracking-widest">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80] md:hidden transition-all duration-500"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
