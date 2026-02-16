import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client.
 * Uses anon key with cookie-based auth — respects RLS.
 * Use in Server Components, API routes, and server actions.
 *
 * NOTE: Using untyped client until Supabase CLI generates full types.
 */
export function createServerClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    return createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    });
}
