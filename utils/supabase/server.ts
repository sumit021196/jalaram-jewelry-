import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export const createClient = async (useAdmin = false) => {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://example.supabase.co";
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy_key";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ||
                     process.env.SUPABASE_SERVICE_KEY ||
                     process.env.SERVICE_ROLE_KEY;

  if (useAdmin) {
    // Explicitly check for Service Role Key to avoid falling back to Anon key which causes RLS 400/403 errors
    const effectiveServiceKey = serviceKey || process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!effectiveServiceKey || effectiveServiceKey === "dummy_service_key" || effectiveServiceKey === supabaseKey) {
      console.error("ADMIN CONFIG ERROR: Service role key is missing, invalid, or identical to Anon key.");
      console.error("Values check:", {
        hasServiceKey: !!effectiveServiceKey,
        isDummy: effectiveServiceKey === "dummy_service_key",
        isSameAsAnon: effectiveServiceKey === supabaseKey
      });
      throw new Error("ADMIN_AUTH_FAILED: Service Role Key is missing or invalid. Storage uploads require the Service Role Key.");
    }

    return createSupabaseClient(
      supabaseUrl,
      effectiveServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false
        },
        global: {
          headers: {
            'apikey': effectiveServiceKey,
            'Authorization': `Bearer ${effectiveServiceKey}`
          }
        }
      }
    );
  }

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
};
