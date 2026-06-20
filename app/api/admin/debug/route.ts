import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient(true);

    // Check buckets
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();

    const envStatus = {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SERVICE_ROLE_KEY),
      isServiceKeySameAsAnon: (process.env.SUPABASE_SERVICE_ROLE_KEY === process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    };

    return NextResponse.json({
      envStatus,
      buckets: buckets || [],
      bucketError: bucketError ? {
        message: bucketError.message,
        name: bucketError.name,
        status: (bucketError as any).status
      } : null
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
