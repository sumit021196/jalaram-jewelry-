import ProductDetailClient from "@/components/ProductDetailClient";
import { ProductService } from "@/services/product.service";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";

export const revalidate = 3600; // Cache for 1 hour (ISR)

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const service = new ProductService(supabase);

  // Fetch product data on the server
  const product = await service.getProductById(id);
  if (!product) {
    notFound();
  }

  // Fetch related products based on category
  const relatedProducts = await service.getRelatedProducts(id, product.category_id);

  // Fetch active coupons
  const coupons = await service.getActiveCoupons();

  return (
    <ProductDetailClient 
      id={id} 
      initialProduct={product as any} 
      initialRelatedProducts={relatedProducts as any} 
      initialCoupons={coupons}
    />
  );
}
