import { createClient } from "@supabase/supabase-js";

/**
 * Server-only elevated client. Never import this module into client components.
 * Prefer the authenticated user's Supabase client for normal operations.
 */
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase admin environment variables are missing.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}