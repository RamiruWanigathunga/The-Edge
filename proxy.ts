import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Frontend-only simulation: check for a cookie instead of Supabase auth
  const onboardedCookie = request.cookies.get("edge-onboarded")?.value;
  const isUserOnboarded = onboardedCookie === "true";

  // If user is not logged in and trying to access a protected route (anything except /auth and public assets)
  const isAuthPage = request.nextUrl.pathname.startsWith("/auth");
  const isPublicRoute = 
    request.nextUrl.pathname.startsWith("/terms") || 
    request.nextUrl.pathname.startsWith("/privacy") ||
    request.nextUrl.pathname.startsWith("/vendor");

  const isPublicAsset = 
    request.nextUrl.pathname.startsWith("/_next") || 
    request.nextUrl.pathname.startsWith("/api") ||
    request.nextUrl.pathname.startsWith("/icons") ||
    request.nextUrl.pathname.startsWith("/images") ||
    request.nextUrl.pathname.startsWith("/manifest.json") ||
    request.nextUrl.pathname === "/favicon.ico";

  if (!isUserOnboarded && !isAuthPage && !isPublicRoute && !isPublicAsset) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  // If user is logged in and trying to access the auth page, redirect to home
  if (isUserOnboarded && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
