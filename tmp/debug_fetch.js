
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
  console.log("Checking products...");
  const { data: products, error: pError } = await supabase
    .from("products")
    .select("*, categories(name)")
    .limit(10);
  
  if (pError) console.error("Products error:", pError.message);
  else console.log("Products count:", products?.length);

  console.log("Checking categories with products...");
  const { data: cats, error: cError } = await supabase
    .from("categories")
    .select("id, name, slug, products!inner(id)");
    
  if (cError) console.error("Categories error:", cError.message);
  else console.log("Categories count:", cats?.length);
}

debug();
