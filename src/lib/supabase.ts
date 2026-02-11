// Re-export browser client for backward compatibility
// Prefer importing from '@/lib/supabase/client' or '@/lib/supabase/server' directly
export { createClient } from './supabase/client'

// Legacy: create a default instance for quick use in client components
import { createClient } from './supabase/client'
export const supabase = createClient()
