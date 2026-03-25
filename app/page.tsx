import { productService, ProductService } from "@/services/product.service";
import Section from "@/components/Section";
import ProductCard from "@/components/ProductCard";
import HeroSection from "@/components/ui/HeroSection";
import { createClient } from "@/utils/supabase/server";
import Ticker from "@/components/ui/Ticker";
import CategoryCircleNav from "@/components/ui/CategoryCircleNav";
import FeaturedCollections from "@/components/ui/FeaturedCollections";
import InstagramReels from "@/components/ui/InstagramReels";
import { Product } from "@/types/product";

export const dynamic = "force-dynamic";

export default async function Page() {
  const supabase = await createClient();
  const service = new ProductService(supabase);
  
  const trending = await service.getTrendingProducts();
  const newArrivals = await service.getNewArrivals();
  const allProducts = await service.getProducts();
  const categories = await service.getCategories();
  const { data: banners } = await supabase.from('banners').select('*').eq('is_active', true);
  
  return (
    <main className="bg-white min-h-screen text-foreground transition-colors duration-500 overflow-x-hidden">
      
      {/* 1. Category Circle Nav (Tanishq Style) */}
      <CategoryCircleNav categories={categories || []} />

      {/* 2. Hero Section */}
      <HeroSection banners={banners || []} />

      {/* 3. New Arrivals */}
      <Section
        title="New Discoveries"
        subtitle="The latest treasures added to our vault"
        ctaHref="/products"
        ctaLabel="View Collection"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {newArrivals.slice(0, 4).map((p: Product) => (
            <ProductCard key={p.id} product={{ id: p.id, name: p.name, price: p.price, mediaUrl: p.media_url }} />
          ))}
        </div>
      </Section>

      {/* 4. Featured Collections (Tanishq Style Grid) */}
      <FeaturedCollections />

      {/* 5. Trending Section */}
      <Section
        title="Most Loved"
        subtitle="Pieces that resonate with our community"
        ctaHref="/products"
        ctaLabel="Shop All"
      >
        <div id="trending" className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {trending.slice(0, 4).map((p: Product) => (
            <ProductCard key={p.id} product={{ id: p.id, name: p.name, price: p.price, mediaUrl: p.media_url }} />
          ))}
        </div>
      </Section>

      {/* 6. Social Feed */}
      <InstagramReels />

      {/* 7. Bottom Ticker */}
      <Ticker className="my-16" />

      {/* 8. Full Inventory Snapshot */}
      <Section
        title="The Eternal Gallery"
        subtitle="Explore our complete range of artificial excellence"
        ctaHref="/products"
        ctaLabel="See Everything"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {allProducts.slice(0, 8).map((p: Product) => (
            <ProductCard key={p.id} product={{ id: p.id, name: p.name, price: p.price, mediaUrl: p.media_url }} />
          ))}
        </div>
      </Section>

    </main>
  );
}
