-- ==========================================
-- SHRI JALARAM JWELLERS - QUICK INIT
-- ==========================================
-- Use this if you have already run full_schema.sql.
-- This script adds the missing settings/banners tables and initializes data.

-- 1. MIGRATIONS (Create missing tables/columns)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    type TEXT NOT NULL DEFAULT 'text',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Settings are viewable by everyone." ON public.settings;
CREATE POLICY "Settings are viewable by everyone." ON public.settings FOR SELECT USING (true);

ALTER TABLE public.banners 
ADD COLUMN IF NOT EXISTS subtitle TEXT,
ADD COLUMN IF NOT EXISTS cta_text TEXT DEFAULT 'Shop Now',
ADD COLUMN IF NOT EXISTS style_type TEXT DEFAULT 'default';

-- 2. INITIAL CLIENT DATA
-- ==========================================
INSERT INTO settings (key, value, type) VALUES
('site_name', '"Shri Jalaram Jwellers"', 'text'),
('site_description', '"Premium Artificial & Traditional Jewellery"', 'text'),
('ticker_text', '"EXQUISITE CRAFTSMANSHIP • NEW ARRIVALS: FESTIVE COLLECTION • FREE SHIPPING ON ORDERS ABOVE ₹4,999 • SHOP THE GLOW"', 'text'),
('contact_email', '"contact@shrijalaramjwellers.com"', 'text'),
('contact_phone', '"+91 9876543210"', 'text'),
('address', '"Main Market, Ahmedabad, Gujarat, India"', 'text'),
('theme_color_primary', '"#800000"', 'text'),
('theme_color_secondary', '"#FFD700"', 'text'),
('social_instagram', '"https://instagram.com/shrijalaramjwellers"', 'text'),
('social_whatsapp', '"https://wa.me/919876543210"', 'text'),
('currency', '"INR"', 'text')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

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

INSERT INTO banners (title, subtitle, image_url, cta_text, link_url, style_type, is_active) VALUES
('Golden Glow', 'Discover our festive collection with timeless designs.', 'https://images.unsplash.com/photo-1573408302382-9014b0208e03?q=80&w=1200&auto=format&fit=crop', 'View Collection', '/products', 'wtflex_bold', true);
