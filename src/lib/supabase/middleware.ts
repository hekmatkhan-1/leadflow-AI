import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Supabase middleware helper — refreshes the auth session and returns
 * both the response (with updated cookies) and the current user.
 *
 * Supabase is not guaranteed to be reachable (no project connected yet), so a
 * failed lookup degrades to "no session" instead of throwing. That keeps every
 * public page rendering and sends dashboard routes to the login page rather
 * than to an error screen.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // Refresh the auth session — getUser validates the JWT
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return { supabaseResponse, user };
  } catch {
    // Unreachable auth backend (DNS failure, timeout, missing config).
    // There is no session to find, and no reason to fail the request.
    return { supabaseResponse, user: null };
  }
}
