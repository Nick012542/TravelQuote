import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value
  const { pathname } = request.nextUrl

  console.log("[v0] Middleware - Path:", pathname, "Token exists:", !!token)

  // Public routes that don't require auth
  const publicRoutes = ["/auth/login", "/auth/sign-up", "/auth/pending-approval", "/api/auth"]
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  // If accessing protected route without token, redirect to login
  if (!isPublicRoute && !token && (pathname.startsWith("/owner") || pathname.startsWith("/sales"))) {
    console.log("[v0] Middleware - Redirecting to login (no token)")
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
