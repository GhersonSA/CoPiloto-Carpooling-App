import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const nextAuthToken =
    req.cookies.get("authjs.session-token")?.value ||
    req.cookies.get("__Secure-authjs.session-token")?.value ||
    req.cookies.get("next-auth.session-token")?.value ||
    req.cookies.get("__Secure-next-auth.session-token")?.value;

  if (
    req.nextUrl.pathname.startsWith("/api/auth") ||
    req.nextUrl.pathname === "/" ||
    req.nextUrl.pathname.startsWith("/api/test-db")
  ) {
    return NextResponse.next();
  }

  // Permitir si existe token local O sesión NextAuth
  if (!token && !nextAuthToken) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Ya no verificamos el token aquí, lo hace el backend
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/passenger/:path*",
    "/payments/:path*",
    "/profile/:path*",
    "/travel/:path*",
    "/ratings/:path*",
    "/settings/:path*",
    "/api/((?!auth|test-db).*)",
  ],
};