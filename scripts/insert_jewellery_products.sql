-- ==========================================
-- SHRI JALARAM JWELLERS - PRODUCT REPLACEMENT (CORRECTED)
-- ==========================================
-- This script clears old dv27 (streetwear) products and inserts 10 premium jewellery items.

-- 1. CLEAR OLD DATA
-- ==========================================
-- We clear additional images, wishlist, and then products.
DELETE FROM public.product_images;
DELETE FROM public.wishlist;
DELETE FROM public.products;

-- 2. INSERT NEW JEWELLERY PRODUCTS
-- ==========================================
-- id is BIGINT, we'll use 101, 102... to stay clear of small auto-inc values.

INSERT INTO public.products (id, name, slug, description, price, category_id, media_url, is_active, stock, is_trending) VALUES
(101, 'Antique Gold Kundan Choker', 'antique-gold-kundan-choker', 'Handcrafted choker with intricate Kundan detailing and pearl drops. Perfect for festive occasions and weddings.', 8500, (SELECT id FROM categories WHERE slug = 'kundan' LIMIT 1), 'https://images.unsplash.com/photo-1599643477877-537ef5278531?q=80&w=800&auto=format&fit=crop', true, 10, true),
(102, 'American Diamond Tear Drop Earrings', 'ad-tear-drop-earrings', 'Elegant AD earrings with high-grade stones and a timeless silver finish.', 2200, (SELECT id FROM categories WHERE slug = 'american-diamond' LIMIT 1), 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop', true, 25, true),
(103, 'Temple Work Lakshmi Bangles', 'temple-lakshmi-bangles', 'Traditional temple jewellery bangles featuring Goddess Lakshmi motifs. 2.4 / 2.6 / 2.8 sizes available.', 4500, (SELECT id FROM categories WHERE slug = 'temple' LIMIT 1), 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop', true, 15, false),
(104, 'Oxidized Silver Jhumka Set', 'oxidized-silver-jhumka', 'Bohemian-style oxidized silver jhumkas with delicate floral carvings and black beads.', 1200, (SELECT id FROM categories WHERE slug = 'oxidized' LIMIT 1), 'https://images.unsplash.com/photo-1626784215021-2e39ccf971cd?q=80&w=800&auto=format&fit=crop', true, 50, true),
(105, 'Classic Jadau Bridal Necklace', 'classic-jadau-bridal-necklace', 'A grand bridal masterpiece with multi-layered stones and emerald highlights.', 15000, (SELECT id FROM categories WHERE slug = 'kundan' LIMIT 1), 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop', true, 5, true),
(106, 'Polki Style Statement Ring', 'polki-statement-ring', 'Adjustable oversized statement ring with a royal polki finish and center ruby stone.', 1800, (SELECT id FROM categories WHERE slug = 'kundan' LIMIT 1), 'https://images.unsplash.com/photo-1605100804763-047af5c52b1a?q=80&w=800&auto=format&fit=crop', true, 30, false),
(107, 'South Indian Guttapusalu Haram', 'guttapusalu-haram', 'Precious pearl-studded necklace inspired by traditional Guttapusalu designs.', 12500, (SELECT id FROM categories WHERE slug = 'temple' LIMIT 1), 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop', true, 8, true),
(108, 'Matte Gold Finish Kada', 'matte-gold-kada', 'Broad matte gold Kada with embossed floral patterns. Openable screw mechanism.', 3200, (SELECT id FROM categories WHERE slug = 'antique-gold' LIMIT 1), 'https://images.unsplash.com/photo-1613133310164-28399321307c?q=80&w=800&auto=format&fit=crop', true, 20, false),
(109, 'Silver Plated AD Maang Tikka', 'silver-ad-maang-tikka', 'Graceful Maang Tikka with shimmering AD stones, perfect for the modern bride.', 1500, (SELECT id FROM categories WHERE slug = 'american-diamond' LIMIT 1), 'https://images.unsplash.com/photo-1598560912005-59765abc33e6?q=80&w=800&auto=format&fit=crop', true, 40, true),
(110, 'Antique Lakshmi Coin Necklace', 'antique-coin-necklace', 'Traditional Kasu Mala featuring stamped coins with Goddess Lakshmi images.', 7800, (SELECT id FROM categories WHERE slug = 'temple' LIMIT 1), 'https://images.unsplash.com/photo-1573408302181-492728956488?q=80&w=800&auto=format&fit=crop', true, 12, true);

-- 3. INSERT ADDITIONAL IMAGES
-- ==========================================

INSERT INTO public.product_images (product_id, image_url, display_order) VALUES
(101, 'https://images.unsplash.com/photo-1635767798638-3e25273a8236?q=80&w=800&auto=format&fit=crop', 1),
(105, 'https://images.unsplash.com/photo-1573408302181-492728956488?q=80&w=800&auto=format&fit=crop', 1);

-- Reset sequence to avoid next auto-inc conflict
SELECT setval(pg_get_serial_sequence('products', 'id'), coalesce(max(id),0) + 1, false) FROM products;
