import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Uses the service-role key: bypasses RLS and can manage auth users.
 * Never import this from client components.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
