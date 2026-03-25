-- Script to initialize a new client project (Shri Jalaram Jwellers)
-- Run this in the Supabase SQL Editor AFTER full_schema.sql

-- 1. Clear existing demo data (Optional - use with caution)
-- DELETE FROM products;
-- DELETE FROM categories;
-- DELETE FROM banners;

-- 2. Insert Default Settings for Shri Jalaram Jwellers
INSERT INTO settings (key, value) VALUES
('site_name', '"Shri Jalaram Jwellers"'),
('site_description', '"Premium Artificial & Traditional Jewellery"'),
('contact_email', '"contact@shrijalaramjwellers.com"'),
('contact_phone', '"+91 9876543210"'),
('address', '"Main Market, Ahmedabad, Gujarat, India"'),
('theme_color_primary', '"#800000"'), -- Maroon
('theme_color_secondary', '"#FFD700"'), -- Gold
('social_instagram', '"https://instagram.com/shrijalaramjwellers"'),
('social_whatsapp', '"https://wa.me/919876543210"'),
('currency', '"INR"'),
('razorpay_key_id', '""'), -- To be filled by client
('delhivery_api_token', '""') -- To be filled by client
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 3. Insert Specific Artificial Jewellery Categories
INSERT INTO categories (name, slug, image_url) VALUES
('American Diamond', 'american-diamond', 'https://images.unsplash.com/photo-1598560912005-59765abc33e6?q=80&w=800&auto=format&fit=crop'),
('Kundan & Jadau', 'kundan', 'https://images.unsplash.com/photo-1635767798638-3e25273a8236?q=80&w=800&auto=format&fit=crop'),
('Oxidized Silver', 'oxidized', 'https://images.unsplash.com/photo-1626784215021-2e39ccf971cd?q=80&w=800&auto=format&fit=crop'),
('Temple Jewellery', 'temple', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop'),
('Antique Gold', 'antique-gold', 'https://images.unsplash.com/photo-1613133310164-28399321307c?q=80&w=800&auto=format&fit=crop'),
('Earrings & Jhumkas', 'earrings', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop'),
('Necklace Sets', 'necklaces', 'https://images.unsplash.com/photo-1599643477877-537ef5278531?q=80&w=800&auto=format&fit=crop'),
('Bangles & Kadas', 'bangles', 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, image_url = EXCLUDED.image_url;

-- 4. Sample Banner for Tanishq Aesthetic
INSERT INTO banners (title, subtitle, image_url, cta_text, link_url, style_type, is_active) VALUES
('Golden Glow', 'Discover our festive collection with timeless designs.', 'https://images.unsplash.com/photo-1573408302382-9014b0208e03?q=80&w=1200&auto=format&fit=crop', 'View Collection', '/products', 'wtflex_bold', true);
