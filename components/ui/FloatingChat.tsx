"use client";

import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";

export default function FloatingChat() {
    const [isVisible, setIsVisible] = useState(false);
    const [isBubbleOpen, setIsBubbleOpen] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 2000);
        return () => clearTimeout(timer);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 right-4 z-[100] md:hidden flex flex-col items-end gap-3 pointer-events-none">
            {/* Chat Bubble Message */}
            {isBubbleOpen && (
                <div className="pointer-events-auto bg-white shadow-2xl rounded-2xl p-4 pr-10 border border-gray-100 flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-500 max-w-[200px] relative">
                    <div className="w-8 h-8 rounded-full bg-[#8B1D3D]/10 flex items-center justify-center flex-shrink-0">
                        <MessageCircle size={18} className="text-[#8B1D3D]" />
                    </div>
                    <p className="text-xs font-bold text-gray-700 leading-tight">
                        How can I help you?
                    </p>
                    <button 
                        onClick={() => setIsBubbleOpen(false)}
                        className="absolute top-2 right-2 p-1 text-gray-300 hover:text-gray-500"
                    >
                        <X size={14} />
                    </button>
                    {/* Tiny Triangle */}
                    <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white border-r border-b border-gray-100 rotate-45" />
                </div>
            )}

            {/* Main Chat Button */}
            <button className="pointer-events-auto w-14 h-14 rounded-full bg-white shadow-2xl border border-gray-100 flex items-center justify-center text-[#8B1D3D] transition-transform active:scale-90 relative">
                <MessageCircle size={28} />
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8B1D3D] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-[#8B1D3D]"></span>
                </span>
            </button>
        </div>
    );
}
