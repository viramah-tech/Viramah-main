import { createClient } from "@supabase/supabase-js";

/**
 * Browser-side Supabase client.
 * Uses anon key — subject to RLS policies.
 * Use in "use client" components only.
 *
 * NOTE: Using untyped client until Supabase CLI generates full types.
 * Run `npx supabase gen types typescript` to generate Database type.
 */
export function createBrowserClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    return createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
        },
    });
}
