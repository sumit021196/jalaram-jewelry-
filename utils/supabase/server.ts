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
    if (!serviceKey || serviceKey === "dummy_service_key" || serviceKey === supabaseKey) {
      console.warn("ADMIN CONFIG WARNING: Service key is missing or same as anon key.");
      // Return the standard client as a fallback instead of crashing
      return createServerClient(
        supabaseUrl,
        supabaseKey,
        {
          cookies: {
            getAll() { return cookieStore.getAll(); },
            setAll(cookiesToSet) {
              try {
                cookiesToSet.forEach(({ name, value, options }) =>
                  cookieStore.set(name, value, options)
                );
              } catch {}
            },
          },
        }
      );
    }
    return createSupabaseClient(
      supabaseUrl,
      serviceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false
        },
        global: {
          headers: {
            'Authorization': `Bearer ${serviceKey}`
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
