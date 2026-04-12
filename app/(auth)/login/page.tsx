
"use client";

import { useState } from "react";
import Link from "next/link";
import { login } from "../auth.actions";
import { ArrowLeft, Loader2, Sparkles, Mail, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSettings } from "@/components/SettingsContext";

export default function LoginPage() {
    const { settings } = useSettings();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);
        const result = await login(formData);
        if (result?.error) {
            setError(result.error);
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen sm:min-h-[100dvh] flex items-center justify-center bg-white sm:bg-gray-50/30 p-4 font-inter overflow-hidden">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-md w-full sm:bg-white sm:p-8 sm:rounded-[2.5rem] sm:shadow-2xl sm:shadow-gray-200/50 sm:border sm:border-gray-100 flex flex-col justify-center min-h-full sm:min-h-0"
            >
                <div className="text-center mb-10">
                    <Link href="/" className="inline-flex items-center text-xs font-bold text-gray-400 hover:text-black transition-colors mb-6 group">
                        <ArrowLeft size={14} className="mr-1 group-hover:-translate-x-1 transition-transform" />
                        Back to Store
                    </Link>
                    <div className="mx-auto h-14 w-14 bg-black rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-black/10">
                        <Sparkles className="text-white h-7 w-7" />
                    </div>
                    <h2 className="text-3xl font-black tracking-tight text-gray-900 mb-2">
                        Welcome Back
                    </h2>
                    <p className="text-sm text-gray-500 max-w-[240px] mx-auto leading-relaxed">
                        Sign in to your {settings.site_name || "account"} to continue.
                    </p>
                </div>

                <form action={handleSubmit} className="space-y-4">
                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-red-50 text-red-600 px-4 py-3 rounded-2xl text-[13px] font-medium border border-red-100 flex items-center"
                            >
                                <span className="mr-2 h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-3">
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={18} />
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="block w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl text-[15px] font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-black transition-all outline-none"
                                placeholder="Email Address"
                            />
                        </div>

                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={18} />
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="block w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl text-[15px] font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-black transition-all outline-none"
                                placeholder="Password"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end px-1">
                        <Link href="#" className="text-[12px] font-bold text-gray-400 hover:text-black transition-colors">
                            Forgot Password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full relative py-4 bg-black text-white text-[15px] font-bold rounded-2xl shadow-lg shadow-black/10 hover:shadow-black/20 hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-70 disabled:hover:translate-y-0 overflow-hidden group"
                    >
                        <AnimatePresence mode="wait">
                            {loading ? (
                                <motion.div 
                                    key="loading"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="flex items-center justify-center"
                                >
                                    <Loader2 className="animate-spin h-5 w-5" />
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="normal"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="flex items-center justify-center font-outfit uppercase tracking-widest text-[13px]"
                                >
                                    Sign In Now
                                </motion.div>
                            )}
                        </AnimatePresence>
                        
                        {/* Shimmer effect on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                    </button>

                    <div className="pt-4 text-center">
                        <p className="text-[13px] text-gray-500 font-medium">
                            First time here?{" "}
                            <Link href="/signup" className="text-black font-black hover:underline underline-offset-4 decoration-2 transition-all">
                                Create Membership
                            </Link>
                        </p>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
