const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing connection to:', supabaseUrl);
console.log('Using Anon Key (start):', supabaseKey?.substring(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    console.log('Fetching products...');
    const { data, error } = await supabase.from('products').select('*').limit(5);
    
    if (error) {
        console.error('Error fetching products:', error.message);
        console.error('Full Error:', JSON.stringify(error, null, 2));
    } else {
        console.log('Success! Found', data.length, 'products.');
        console.log('Sample Product:', data[0]?.name);
    }

    console.log('Fetching categories...');
    const { data: catData, error: catError } = await supabase.from('categories').select('*').limit(5);
    if (catError) {
        console.error('Error fetching categories:', catError.message);
    } else {
        console.log('Success! Found', catData.length, 'categories.');
    }
}

test();
