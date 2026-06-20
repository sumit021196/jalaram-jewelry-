import { NextResponse } from 'next/server';

export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SERVICE_ROLE_KEY;

    return NextResponse.json({
        diagnostics: {
            hasUrl: !!supabaseUrl,
            urlPrefix: supabaseUrl?.substring(0, 15),
            hasAnonKey: !!anonKey,
            anonKeyPrefix: anonKey?.substring(0, 10),
            hasServiceKey: !!serviceKey,
            serviceKeyPrefix: serviceKey?.substring(0, 10),
            isServiceKeySameAsAnon: !!serviceKey && serviceKey === anonKey,
            isDummyKey: serviceKey === 'dummy_service_key'
        }
    });
}
