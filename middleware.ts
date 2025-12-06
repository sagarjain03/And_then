import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"


const PROTECTED_PATHS = [
  "/dashboard",
  "/test",
  "/test/results",
  "/stories",
]

function isProtectedPath(pathname: string): boolean {
  return (
    PROTECTED_PATHS.some((base) => pathname === base || pathname.startsWith(`${base}/`))
  )
}

function isAuthPath(pathname: string): boolean {
  return pathname.startsWith("/auth")
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip Next.js internals and static assets
  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.startsWith("/favicon")) {
    return NextResponse.next()
  }

  const token = request.cookies.get("token")?.value

  // If route is protected and there is no token, redirect to login.
  if (isProtectedPath(pathname) && !token) {
    const loginUrl = new URL("/auth/login", request.url)
    loginUrl.searchParams.set("from", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If user is already logged in and hits an auth page, push them to dashboard.
  if (token && isAuthPath(pathname)) {
    const dashboardUrl = new URL("/dashboard", request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/test",
    "/test/results/:path*",
    "/stories/:path*",
    "/auth/:path*",
  ],
}
