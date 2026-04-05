import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/auth/jwt";

export async function middleware(request: NextRequest) {
  const session = request.cookies.get("session")?.value;

  // Protect dashboard and calendar routes
  if (
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname.startsWith("/calendar")
  ) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    
    try {
      await decrypt(session);
    } catch (err) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Redirect to dashboard if logged in and trying to access auth pages
  if (
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/signup")
  ) {
    if (session) {
      try {
        await decrypt(session);
        return NextResponse.redirect(new URL("/", request.url));
      } catch (err) {
        // Invalid session, let them stay on login
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
