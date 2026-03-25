"use client";

import Link from "next/link";
import { 
  Sparkles, 
  CircleDot, 
  Gem, 
  Dna, 
  Briefcase, 
  Package, 
  Heart, 
  Gift, 
  MoreHorizontal,
  ChevronRight
} from "lucide-react";

interface Category {
  id: string | number;
  name: string;
  slug: string;
  image_url?: string;
}

const CATEGORY_ICONS: Record<string, any> = {
  'all': Sparkles,
  'gold': CircleDot,
  'diamond': Gem,
  'rings': CircleDot,
  'earrings': Dna,
  'daily-wear': Briefcase,
  'collections': Package,
  'wedding': Heart,
  'gifting': Gift,
  'more': MoreHorizontal,
};

export default function CategoryCircleNav({ categories = [] }: { categories?: Category[] }) {
  return (
    <section className="bg-white py-4 md:py-6 overflow-hidden">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12">
        <div className="flex items-start gap-4 sm:gap-8 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
          {/* All Jewellery Category */}
          <Link
            href="/products"
            className="flex-shrink-0 flex flex-col items-center gap-3 group"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-gray-100 flex items-center justify-center bg-gray-50 group-hover:border-[#8B1D3D] group-hover:bg-white transition-all duration-300">
              <Sparkles size={24} className="text-[#8B1D3D] group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-gray-600 uppercase tracking-wider text-center group-hover:text-[#8B1D3D]">
              All Jewellery
            </span>
          </Link>

          {/* Dynamic Categories From DB */}
          {categories.map((category) => {
            const Icon = CATEGORY_ICONS[category.slug] || Sparkles;
            return (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="flex-shrink-0 flex flex-col items-center gap-3 group"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-gray-100 p-1 flex items-center justify-center bg-white group-hover:border-[#8B1D3D] shadow-sm transition-all duration-300">
                  <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-gray-50">
                    {category.image_url ? (
                      <img
                        src={category.image_url}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <Icon size={24} className="text-[#8B1D3D] group-hover:scale-110 transition-transform" />
                    )}
                  </div>
                </div>
                <span className="text-[10px] sm:text-xs font-bold text-gray-600 uppercase tracking-wider text-center group-hover:text-[#8B1D3D] max-w-[80px]">
                  {category.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
