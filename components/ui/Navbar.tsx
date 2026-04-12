"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/components/cart/CartContext";
import CartDrawer from "@/components/cart/CartDrawer";
import {
    Menu,
    X,
    ShoppingBag,
    Home,
    Grid3X3,
    TrendingUp,
    User,
    LogOut,
    ChevronDown,
    Search,
    Package,
    LayoutDashboard,
    Heart,
    MapPin,
    Gem,
    Mic,
    Camera,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { logout } from "@/app/(auth)/auth.actions";
import { User as UserType } from "@supabase/supabase-js";
import Image from "next/image";
import Ticker from "./Ticker";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
    { href: "/products", label: "Shop All" },
    { href: "/#trending", label: "Trending" },
];

import { useSettings } from "@/components/SettingsContext";

export default function Navbar() {
    const { settings } = useSettings();
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const cart = useCart();

    const [user, setUser] = useState<UserType | null>(null);
    const [profileOpen, setProfileOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);

        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('is_admin')
                    .eq('id', user.id)
                    .single();
                setIsAdmin(!!profile?.is_admin);
            } else {
                setIsAdmin(false);
            }
        };
        fetchUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            const newUser = session?.user ?? null;
            setUser(newUser);
            if (newUser) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('is_admin')
                    .eq('id', newUser.id)
                    .single();
                setIsAdmin(!!profile?.is_admin);
            } else {
                setIsAdmin(false);
            }
        });

        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (profileOpen && !target.closest('.profile-container')) {
                setProfileOpen(false);
            }
        };

        window.addEventListener("mousedown", handleClickOutside);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("mousedown", handleClickOutside);
            subscription.unsubscribe();
        };
    }, [supabase.auth, profileOpen]);

    if (pathname.startsWith('/admin')) return null;
    const totalItems = cart.items.reduce((acc, current) => acc + current.qty, 0);

    return (
        <>
            <div className="fixed inset-x-0 top-0 z-[60]">
                <Ticker />
                <header
                    className={`transition-all duration-300 bg-white border-b border-gray-100 ${isScrolled ? "py-1.5" : "py-2.5"}`}
                >
                    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12">
                        {/* Row 1: Logo & Icons */}
                        <div className="flex items-center justify-between gap-4">
                            
                            {/* Mobile Hamburger & Logo Group */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                    onClick={() => setMobileMenuOpen(true)}
                                    type="button"
                                    className="md:hidden p-1.5 text-gray-600"
                                >
                                    <Menu size={22} />
                                </button>
                                <Link href="/" className="flex items-center transition-all hover:scale-105 ml-1">
                                    <Image 
                                        src="/logo.svg" 
                                        alt={settings.site_name || "Shri Jalaram Jewellers"} 
                                        width={180}
                                        height={45}
                                        className="h-10 sm:h-14 w-auto object-contain"
                                        priority
                                    />
                                </Link>
                            </div>

                            {/* Pincode Selector (Desktop Only) */}
                            <button className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-gray-400 hover:text-brand-red transition-colors uppercase tracking-tight">
                                <MapPin size={12} />
                                <span>Deliver to 380001</span>
                                <ChevronDown size={12} />
                            </button>

                            {/* Desktop Search (Centered) */}
                            <div className="hidden md:flex flex-1 items-center justify-center max-w-xl px-4">
                                <div className="relative w-full group">
                                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                        <Search size={18} className="text-gray-400 group-focus-within:text-brand-red transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && searchQuery.trim()) {
                                                router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
                                            }
                                        }}
                                        placeholder="Search for Rings, Earrings & more..."
                                        className="w-full bg-[#fdf2f4] border border-transparent rounded-full py-2.5 pl-12 pr-16 text-sm outline-none focus:border-brand-red focus:bg-white transition-all shadow-sm group-hover:shadow-md"
                                    />
                                    <div className="absolute inset-y-0 right-4 flex items-center gap-3">
                                        <button className="text-gray-400 hover:text-brand-red transition-colors"><Mic size={16} /></button>
                                    </div>
                                </div>
                            </div>

                            {/* Icons (Right) */}
                            <div className="flex items-center gap-0.5 sm:gap-2 flex-shrink-0">
                                {/* Wishlist */}
                                <Link href="/wishlist" className="flex flex-col items-center px-1.5 py-1 text-gray-500 hover:text-brand-red transition-colors group">
                                    <Heart size={18} className="group-hover:scale-110 transition-transform md:w-5 md:h-5" />
                                    <span className="text-[8px] font-medium mt-0.5 hidden lg:block">Wishlist</span>
                                </Link>

                                {/* Account */}
                                <div className="relative profile-container group" onMouseEnter={() => setProfileOpen(true)} onMouseLeave={() => setProfileOpen(false)}>
                                    {user ? (
                                        <>
                                            <Link
                                                href={isAdmin ? "/admin" : "/profile"}
                                                className="flex flex-col items-center p-2 text-gray-500 hover:text-brand-red transition-colors group"
                                            >
                                                <User size={20} className="group-hover:scale-110 transition-transform" />
                                                <span className="text-[9px] font-medium mt-1 hidden lg:block">{isAdmin ? "Admin" : "Profile"}</span>
                                            </Link>
                                            
                                            <AnimatePresence>
                                                {profileOpen && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                        className="absolute right-0 mt-0 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[100] py-2 hidden md:block"
                                                    >
                                                        <div className="px-4 py-3 border-b border-gray-50 mb-2">
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Welcome back</p>
                                                            <p className="text-sm font-bold text-gray-900 truncate">{user.email || 'User'}</p>
                                                        </div>
                                                        
                                                        {isAdmin && (
                                                            <Link 
                                                                href="/admin" 
                                                                className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-brand-red hover:bg-brand-red/5 transition-colors"
                                                            >
                                                                <LayoutDashboard size={18} />
                                                                Admin Dashboard
                                                            </Link>
                                                        )}
                                                        
                                                        <Link 
                                                            href="/profile" 
                                                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                                                        >
                                                            <User size={18} />
                                                            My Profile
                                                        </Link>
                                                        
                                                        <Link 
                                                            href="/orders" 
                                                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                                                        >
                                                            <Package size={18} />
                                                            Order History
                                                        </Link>
                                                        
                                                        <div className="h-px bg-gray-50 my-2" />
                                                        
                                                        <button 
                                                            onClick={async () => {
                                                                setProfileOpen(false);
                                                                cart.clear();
                                                                await logout();
                                                            }}
                                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors text-left"
                                                        >
                                                            <LogOut size={18} />
                                                            Sign Out
                                                        </button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </>
                                    ) : (
                                        <Link
                                            href="/login"
                                            className="flex flex-col items-center p-2 text-gray-500 hover:text-brand-red transition-colors group"
                                        >
                                            <User size={20} className="group-hover:scale-110 transition-transform" />
                                            <span className="text-[9px] font-medium mt-1 hidden lg:block">Login</span>
                                        </Link>
                                    )}
                                </div>

                                {/* Cart */}
                                <button
                                    type="button"
                                    onClick={() => cart.openCart()}
                                    className="relative flex flex-col items-center px-1.5 py-1 text-gray-500 hover:text-brand-red transition-colors group"
                                >
                                    <ShoppingBag size={18} className="group-hover:scale-110 transition-transform md:w-5 md:h-5" />
                                    {totalItems > 0 && (
                                        <span className="absolute top-0.5 right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-brand-red text-[7px] font-bold text-white">
                                            {totalItems}
                                        </span>
                                    )}
                                    <span className="text-[8px] font-medium mt-0.5 hidden lg:block">Cart</span>
                                </button>
                            </div>
                        </div>

                        {/* Row 2: Mobile Search Bar (Permanent as Tanishq) */}
                        <div className="mt-2 md:hidden">
                            <div className="relative w-full">
                                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && searchQuery.trim()) {
                                            router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
                                        }
                                    }}
                                    placeholder="Search jewellery..."
                                    className="w-full bg-gray-50 border border-gray-100 rounded-full py-1.5 pl-9 pr-14 text-[11px] outline-none focus:bg-white focus:border-gray-200 transition-all font-medium"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2.5">
                                    <Camera size={12} className="text-gray-400" />
                                    <Mic size={12} className="text-gray-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                </header>
            </div>

            {/* Cart Drawer */}
            <CartDrawer />

            {/* Mobile Nav Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-[70] bg-background md:hidden animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
                    <div className="absolute inset-y-0 left-0 w-[280px] bg-white shadow-2xl animate-in slide-in-from-left duration-500 flex flex-col">
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                             <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center">
                                <Image 
                                    src="/logo.svg" 
                                    alt={settings.site_name || "Shri Jalaram Jwellers"} 
                                    width={160}
                                    height={40}
                                    className="h-10 w-auto object-contain"
                                />
                             </Link>
                             <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 transition-colors"><X size={24} /></button>
                        </div>
                        
                        <nav className="flex-1 overflow-y-auto p-6 space-y-4">
                             {navLinks.map(({ href, label }) => (
                                <Link
                                    key={href}
                                    href={href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block text-lg font-heading font-medium text-gray-800 hover:text-brand-red transition-colors"
                                >
                                    {label}
                                </Link>
                            ))}
                             <div className="pt-4 mt-4 border-t border-gray-50 space-y-4">
                                {isAdmin && (
                                    <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-bold text-brand-red uppercase tracking-widest hover:text-brand-red">Admin Dashboard</Link>
                                )}
                                <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-bold text-gray-400 uppercase tracking-widest hover:text-brand-red">My Account</Link>
                                <Link href="/wishlist" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-bold text-gray-400 uppercase tracking-widest hover:text-brand-red">Wishlist</Link>
                                <Link href="/stores" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-bold text-gray-400 uppercase tracking-widest hover:text-brand-red">Store Locator</Link>
                             </div>
                        </nav>

                        <div className="p-6 border-t border-gray-50">
                             <button 
                                onClick={async () => {
                                    cart.clear();
                                    await logout();
                                    setMobileMenuOpen(false);
                                    router.push('/');
                                }}
                                className="w-full py-4 bg-brand-red text-white font-bold uppercase tracking-widest text-[10px] rounded-full shadow-lg active:scale-95 transition-all"
                             >
                                 Logout
                             </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Spacer for fixed header (Ticker + Navbar) */}
            <div className={`transition-all duration-300 ${isScrolled ? "h-[145px] md:h-[135px]" : "h-[160px] md:h-[145px]"}`} />
        </>
    );
}
