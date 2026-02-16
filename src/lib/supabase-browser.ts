import { createBrowserClient } from "@supabase/ssr";

/**
 * Create a Supabase client for use in Client Components.
 * 
 * This uses @supabase/ssr which automatically:
 * - Stores session tokens in cookies (not just localStorage)
 * - Makes tokens available to server middleware
 * - Handles token refresh automatically
 * 
 * Use this in all client-side code (hooks, components, pages).
 */
export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}
