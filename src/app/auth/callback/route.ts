import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Auth callback route — handles the redirect from Supabase after
 * a password reset email link is clicked. Exchanges the auth code
 * for a session and redirects to the reset-password page.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect to the password reset page where the user sets a new password
  return NextResponse.redirect(new URL("/auth/reset-password", request.url));
}
