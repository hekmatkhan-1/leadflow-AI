import { createClient } from "@supabase/supabase-js";

/**
 * Supabase admin client using the service role key.
 * Bypasses RLS — use only for privileged server-side operations
 * like creating a business row during signup.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
