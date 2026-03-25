"use client";
import { useEffect, useMemo, useState, useRef } from "react";
import { FALLBACK_IMG } from "@/utils/images";
import Link from "next/link";
import { useCart } from "./cart/CartContext";
import { X, ChevronRight, ChevronLeft, Minus, Plus, Heart, Share2, ShieldCheck, Truck, RefreshCw, Star } from "lucide-react";
import { fallback } from "@/utils/data";
import { productService } from "@/services/product.service";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";

type Product = {
  id: string | number;
  name: string;
  price: number;
  image_url?: string | null;
  media_url?: string | null;
  rating?: number | null;
  stock?: number | null;
  description?: string | null;
  variants?: Array<{
    id: string;
    color?: string | null;
    size?: string | null;
    stock?: number;
    sku?: string | null;
  }>;
};

export default function ProductDetailClient({ id }: { id: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const cart = useCart();
  const [wished, setWished] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isAdded, setIsAdded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const mainCtaRef = useRef<HTMLDivElement>(null);

  const images = useMemo(() => {
    if (!product) return [FALLBACK_IMG];
    const mainImg = product.media_url || product.image_url;
    // For demo/fallback purposes if there are no additional images
    return [mainImg, mainImg, mainImg].filter((s): s is string => !!s);
  }, [product]);

  const availableColors = useMemo(() => {
    if (!product?.variants) return [];
    const colors = product.variants.map(v => v.color).filter((c): c is string => !!c);
    return Array.from(new Set(colors));
  }, [product?.variants]);

  const availableSizes = useMemo(() => {
    if (!product?.variants) return [];
    const sizes = product.variants.map(v => v.size).filter((s): s is string => !!s);
    return Array.from(new Set(sizes));
  }, [product?.variants]);

  const virtualSizes = useMemo(() => {
    if (availableSizes.length > 0) return availableSizes;
    const lowerName = product?.name.toLowerCase() || "";
    // Jewellery sizes: adjustable or specific ring sizes
    const isRing = lowerName.includes("ring");
    if (isRing) return ["6", "7", "8", "9"];
    return ["Adjustable"];
  }, [availableSizes, product?.name]);

  useEffect(() => {
    const fetchOne = async () => {
      setLoading(true);
      try {
        const data = await productService.getProductById(id);
        if (!data) throw new Error("Not found");
        setProduct(data as unknown as Product);

        // Fetch related products after product is loaded
        const related = await productService.getRelatedProducts(id, (data as any).category_id);
        setRelatedProducts(related as unknown as Product[]);
      } catch {
        const fallbackItem = fallback.find((i) => String(i.id) === String(id));
        if (fallbackItem) {
          setProduct(fallbackItem as unknown as Product);
          // Set some related products from fallback for UX if db fails
          setRelatedProducts(fallback.filter(i => String(i.id) !== String(id)).slice(0, 4) as unknown as Product[]);
        } else {
          setProduct(null);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchOne();
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      if (mainCtaRef.current) {
        const rect = mainCtaRef.current.getBoundingClientRect();
        setShowStickyBar(rect.top < 0);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAddToCart = () => {
    const needsColor = availableColors.length > 0;
    const needsSize = virtualSizes.length > 0;
    
    if ((needsColor && !selectedColor) || (needsSize && !selectedSize)) {
        alert("Please select " + [needsColor && !selectedColor ? "Color" : "", needsSize && !selectedSize ? "Size" : ""].filter(Boolean).join(" and "));
        return;
    }

    const selectedVariant = product?.variants?.find(v => 
        (needsColor ? v.color === selectedColor : true) && 
        (needsSize ? v.size === selectedSize : true)
    );

    cart.add({ 
        id: product!.id, 
        name: product!.name, 
        price: product!.price, 
        image: product!.media_url || product!.image_url || undefined,
        variant_id: selectedVariant?.id,
        size: selectedSize || undefined,
        color: selectedColor || undefined
    }, quantity);

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const src = product?.media_url || product?.image_url || "";
  const rating = product?.rating ?? 4.2;
  const stock = product?.stock ?? 12;

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-[3/4] bg-muted rounded-3xl animate-pulse" />
          <div className="space-y-6">
            <div className="h-10 w-2/3 bg-muted rounded-xl animate-pulse" />
            <div className="h-4 w-1/3 bg-muted rounded-lg animate-pulse" />
            <div className="h-12 w-1/2 bg-muted rounded-2xl animate-pulse" />
            <div className="space-y-3 pt-4">
              <div className="h-4 w-full bg-muted rounded-lg animate-pulse" />
              <div className="h-4 w-5/6 bg-muted rounded-lg animate-pulse" />
              <div className="h-4 w-4/6 bg-muted rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-24 text-center">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
          <X className="text-muted-foreground/30" size={32} />
        </div>
        <h2 className="text-2xl font-serif font-bold tracking-tight text-foreground">Jewel Not Found</h2>
        <p className="mt-2 text-[10px] font-medium text-muted-foreground uppercase tracking-widest">The masterpiece you're looking for might have been moved to our private vault.</p>
        <Link className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-foreground text-background px-8 py-4 text-[10px] font-serif font-bold uppercase tracking-widest hover:bg-brand-accent hover:text-white transition-all shadow-lg" href="/products">
          Browse All Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pb-24 md:pb-0">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
          
          {/* Left Side: Images */}
          <div className="lg:col-span-7 space-y-6">
             {/* Mobile/Desktop Carousel */}
             <div className="relative aspect-[3/4] rounded-[40px] overflow-hidden group bg-muted/30 border border-foreground/5 shadow-2xl">
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={currentImageIndex}
                    src={images[currentImageIndex]} 
                    alt={product.name} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>
                
                {/* Carousel Controls */}
                <button 
                  onClick={() => setCurrentImageIndex(prev => (prev > 0 ? prev - 1 : images.length - 1))}
                  className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={() => setCurrentImageIndex(prev => (prev < images.length - 1 ? prev + 1 : 0))}
                  className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  <ChevronRight size={24} />
                </button>

                {/* Indicators */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, i) => (
                    <button 
                      key={i} 
                      onClick={() => setCurrentImageIndex(i)}
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-300",
                        currentImageIndex === i ? "w-8 bg-foreground" : "w-1.5 bg-foreground/20 hover:bg-foreground/40"
                      )}
                    />
                  ))}
                </div>

                {/* Badges */}
                <div className="absolute top-8 left-8 flex flex-col gap-2">
                  <div className="bg-brand-accent text-white px-4 py-1.5 rounded-full text-[10px] font-medium uppercase tracking-widest shadow-xl">
                    LIMITED EDITION
                  </div>
                  <div className="bg-foreground text-background px-4 py-1.5 rounded-full text-[10px] font-medium uppercase tracking-widest shadow-xl">
                    New Collection
                  </div>
                </div>
             </div>

             {/* Thumbnail Grid - Desktop only hidden on small */}
             <div className="hidden md:grid grid-cols-4 gap-4">
                {images.map((s, i) => (
                  <button 
                    key={i} 
                    onClick={() => setCurrentImageIndex(i)}
                    className={cn(
                      "aspect-[3/4] rounded-2xl border-2 overflow-hidden transition-all",
                      currentImageIndex === i ? "border-foreground shadow-lg" : "border-transparent opacity-60 hover:opacity-100"
                    )}
                  >
                    <img src={s} className="w-full h-full object-cover" />
                  </button>
                ))}
             </div>
          </div>

          {/* Right Side: Details */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                 <Link href="/products" className="text-[10px] font-medium uppercase tracking-widest hover:text-foreground transition-colors">House of Jalaram</Link>
                 <ChevronRight size={10} />
                 <span className="text-[10px] font-medium uppercase tracking-widest text-foreground">{(product as any).category_name || "Jewellery"}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-foreground leading-tight mt-2">
                {product.name}
              </h1>
            </div>

            <div className="mt-8 flex flex-col gap-2">
              <div className="flex items-center gap-4">
                <span className="text-4xl font-serif font-bold text-brand-accent tracking-tight">₹{product.price.toLocaleString('en-IN')}</span>
                <span className="text-xl text-muted-foreground line-through decoration-brand-accent/30 tracking-tight">₹{(product.price * 1.5).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="flex gap-0.5">
                   {[1,2,3,4,5].map(i => <Star key={i} size={14} className={i <= rating ? "fill-brand-accent text-brand-accent" : "text-foreground/10"} />)}
                 </div>
                 <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">(480+ Verified Reviews)</span>
              </div>
            </div>

            {/* Available Offers */}
            <div className="mt-8">
               <h3 className="text-[10px] font-serif font-bold uppercase tracking-widest text-foreground/40 mb-4">Exclusive Member Perks</h3>
               <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                  <div className="flex-none w-[200px] p-5 rounded-3xl border-2 border-emerald-500/10 bg-emerald-500/5 space-y-2">
                     <span className="text-[10px] font-bold uppercase text-emerald-600">FESTIVE10</span>
                     <p className="text-[9px] font-medium text-emerald-800 uppercase tracking-widest">10% instant discount on all prepaid masterpieces.</p>
                  </div>
                  <div className="flex-none w-[200px] p-5 rounded-3xl border-2 border-brand-accent/10 bg-brand-accent/5 space-y-2">
                     <span className="text-[10px] font-bold uppercase text-brand-accent">GLOW1000</span>
                     <p className="text-[9px] font-medium text-brand-accent uppercase tracking-widest">Flat ₹1,000 off on festive orders above ₹4,999.</p>
                  </div>
               </div>
            </div>

            <p className="mt-10 text-sm font-medium text-muted-foreground leading-relaxed">
              {product.description ?? "A timeless masterpiece meticulously crafted with intricate detailing, embodying the elegance of traditional Indian heritage. This piece is designed to be cherished for generations."}
            </p>

            {/* Variants */}
            <div className="mt-12 space-y-10">
              {/* Color Selection */}
              {availableColors.length > 0 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground">Color: <span className="text-muted-foreground ml-1">{selectedColor || "Select"}</span></h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {availableColors.map(color => (
                        <button 
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={cn(
                            "px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border-2",
                            selectedColor === color 
                              ? "border-foreground bg-foreground text-background shadow-xl" 
                              : "border-foreground/5 text-foreground hover:border-foreground/20"
                          )}
                        >
                          {color}
                        </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {virtualSizes.length > 0 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground">Size: <span className="text-muted-foreground ml-1">{selectedSize || "Select"}</span></h3>
                    <button className="text-[10px] font-black uppercase tracking-widest underline decoration-brand-accent underline-offset-4 text-brand-accent">Size Guide</button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {virtualSizes.map(size => (
                        <button 
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={cn(
                            "w-16 h-12 flex items-center justify-center rounded-full text-[10px] font-black uppercase tracking-widest transition-all border-2",
                            selectedSize === size 
                              ? "border-foreground bg-foreground text-background shadow-xl" 
                              : "border-foreground/5 text-foreground hover:border-foreground/20"
                          )}
                        >
                          {size}
                        </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quantity and CTA */}
            <div className="mt-12 flex flex-col gap-6" ref={mainCtaRef}>
              <div className="flex items-center gap-4">
                 <div className="flex items-center border-2 border-foreground/5 rounded-full px-2 py-1">
                   <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:text-brand-accent transition-colors"><Minus size={16} /></button>
                   <span className="w-12 text-center font-black">{quantity}</span>
                   <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:text-brand-accent transition-colors"><Plus size={16} /></button>
                 </div>
                 <button 
                  aria-label="Wishlist"
                  onClick={() => setWished(v => !v)}
                  className={cn(
                    "w-14 h-14 flex items-center justify-center rounded-full border-2 transition-all",
                    wished ? "bg-brand-red border-brand-red text-white shadow-xl shadow-brand-red/20" : "border-foreground/5 hover:border-foreground/20"
                  )}
                 >
                   <Heart size={20} className={wished ? "fill-current" : ""} />
                 </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isAdded}
                className={cn(
                  "w-full h-20 rounded-full font-serif font-bold uppercase tracking-[0.3em] text-xs transition-all active:scale-[0.98] shadow-2xl relative overflow-hidden group border border-foreground/5",
                  isAdded ? "bg-emerald-500 text-white" : "bg-foreground text-background hover:bg-brand-accent hover:text-white"
                )}
              >
                <span className="relative z-10">{isAdded ? "Secured in Selection" : "Add to Selection"}</span>
                {!isAdded && <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />}
              </button>
            </div>

            {/* Features/Trust */}
            <div className="mt-12 grid grid-cols-3 gap-4 py-8 border-y border-foreground/5">
              <div className="flex flex-col items-center text-center gap-2">
                <Truck size={20} className="text-brand-accent" />
                <span className="text-[8px] font-black uppercase tracking-widest">Global Shipping</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <ShieldCheck size={20} className="text-brand-accent" />
                <span className="text-[8px] font-black uppercase tracking-widest">Secure Payments</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <RefreshCw size={20} className="text-brand-accent" />
                <span className="text-[8px] font-black uppercase tracking-widest">7-Day Return</span>
              </div>
            </div>

            {/* Details Accordion */}
            <div className="mt-8 space-y-4">
              <Disclosure title="Artisan Description" content={product.description || "A timeless masterpiece."} defaultOpen />
              <Disclosure title="Material & Care" content="Premium artificial gold plating with high-quality AD/Kundan stones. Keep away from water and chemicals. Store in a cool, dry place." />
              <Disclosure title="Shipping & Returns" content="Dispatched within 24-48 hours. Easy returns up to 7 days." />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-2xl border-t border-foreground/5 z-50 p-4 block md:hidden shadow-[0_-20px_50px_rgba(0,0,0,0.1)]"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img src={images[0]} className="w-12 h-16 object-cover rounded-xl" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase truncate max-w-[120px]">{product.name}</span>
                  <span className="text-sm font-black text-brand-red">₹{product.price}</span>
                </div>
              </div>
              <button 
                onClick={handleAddToCart}
                className="flex-1 max-w-[160px] h-14 bg-foreground text-background rounded-2xl font-black uppercase text-[10px] tracking-widest"
              >
                {isAdded ? "Added" : "Add to Bag"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recommendations / Complete the Look */}
      {relatedProducts.length > 0 && (
        <section className="mt-20 py-24 bg-muted/20 border-t border-foreground/5">
          <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
              <h2 className="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-12">Complete the <span className="text-brand-accent italic">Look</span></h2>
              <div className="flex gap-6 overflow-x-auto no-scrollbar pb-8">
                {relatedProducts.map((p) => (
                  <Link key={p.id} href={`/product/${p.id}`} className="flex-none w-[280px] group">
                     <div className="aspect-[3/4] rounded-[48px] overflow-hidden bg-background mb-4 relative shadow-xl transform transition-all duration-500 group-hover:-translate-y-3 group-hover:shadow-2xl">
                        <img src={p.media_url || p.image_url || FALLBACK_IMG} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                           <ChevronRight size={20} className="text-brand-accent" />
                        </div>
                     </div>
                     <h3 className="font-serif font-bold text-sm tracking-tight text-foreground">{p.name}</h3>
                     <p className="text-brand-accent font-serif font-bold text-sm mt-1">₹{p.price.toLocaleString('en-IN')}</p>
                  </Link>
                ))}
              </div>
          </div>
        </section>
      )}
    </div>
  );
}

function Disclosure({ title, content, defaultOpen = false }: { title: string; content: string; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-foreground/5">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] hover:text-brand-accent transition-colors"
      >
        <span>{title}</span>
        <Plus size={14} className={cn("transition-transform duration-300", isOpen && "rotate-45")} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-xs font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
              {content}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Magnify({ src, alt }: { src: string; alt: string }) {
  const [bgPos, setBgPos] = useState("center");
  const [hovered, setHovered] = useState(false);
  const safeSrc = src || FALLBACK_IMG;
  return (
    <div
      className="relative w-full overflow-hidden rounded-[32px]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setBgPos("center"); }}
      onMouseMove={(e) => {
        const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setBgPos(`${x}% ${y}%`);
      }}
      style={{
        backgroundImage: `url("${safeSrc}")`,
        backgroundSize: hovered ? "200%" : "cover",
        backgroundPosition: hovered ? bgPos : "center",
        aspectRatio: "3 / 4",
      }}
      aria-label={alt}
    />
  );
}
