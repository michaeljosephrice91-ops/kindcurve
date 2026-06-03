import { NextResponse, type NextRequest } from "next/server";

/**
 * Kind Curve demo middleware.
 *
 * The demo is a self-contained walkthrough: no auth, no Supabase, no env vars.
 * Nothing is gated — every route renders straight through so the full journey
 * works with zero environment configuration.
 *
 * (The previous version read process.env.NEXT_PUBLIC_SUPABASE_URL! and gated
 *  /success and /dashboard behind auth, which crashed the app with no env set.)
 */
export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
