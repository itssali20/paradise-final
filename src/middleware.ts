import { NextResponse, type NextRequest } from "next/server";

/** Exposes the current path to server components (used for login redirects). */
export function middleware(req: NextRequest) {
  const h = new Headers(req.headers);
  h.set("x-pathname", req.nextUrl.pathname + req.nextUrl.search);
  return NextResponse.next({ request: { headers: h } });
}

export const config = { matcher: ["/account/:path*", "/admin/:path*", "/book/:path*", "/casting/vote"] };
