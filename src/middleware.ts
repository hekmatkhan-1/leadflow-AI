import { updateSession } from "@/lib/supabase/middleware";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Next.js middleware — protects dashboard routes and redirects
 * authenticated users away from auth pages.
 */
export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);

  const { pathname } = request.nextUrl;

  // All dashboard routes live under /dashboard
  const isProtected = pathname === "/dashboard" || pathname.startsWith("/dashboard/");

  // Auth pages (login, signup, reset-password)
  const authPaths = ["/login", "/signup", "/reset-password"];
  const isAuthPage = authPaths.some((p) => pathname === p || pathname.startsWith(p + "/"));

  // 1. Protect dashboard routes — redirect unauthenticated users to /login
  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // 2. Redirect authenticated users away from auth pages to /dashboard
  if (isAuthPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|embed|api/chat|api/leads).*)",
  ],
};
