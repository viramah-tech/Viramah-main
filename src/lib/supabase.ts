import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Use createBrowserClient for better Next.js App Router compatibility (cookies)
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

