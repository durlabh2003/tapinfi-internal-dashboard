import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  const { pathname } = req.nextUrl;

  // ===============================
  // Public Routes (no auth needed)
  // ===============================

  const publicRoutes = [
    "/login",
    "/forgot-password",
    "/reset-password",
    "/api/auth/login",
    "/api/auth/forgot-password",
    "/api/auth/reset-password",
  ];

  if (publicRoutes.some((route) =>
    pathname.startsWith(route)
  )) {
    // If already logged in, prevent going back to login
    if (pathname === "/login" && token) {
      try {
        verifyToken(token);
        return NextResponse.redirect(
          new URL("/dashboard", req.url)
        );
      } catch {
        return NextResponse.next();
      }
    }

    return NextResponse.next();
  }

  // ===============================
  // Protected Routes
  // ===============================

  const protectedRoutes = [
    "/dashboard",
    "/upload",
    "/run-campaign",
    "/slots",
    "/global-search",
    "/failed-campaign",
    "/admin",
    "/change-password",
  ];

  const isProtected = protectedRoutes.some(
    (route) =>
      pathname.startsWith(route)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  // No token → redirect to login
  if (!token) {
    return NextResponse.redirect(
      new URL("/login", req.url)
    );
  }

  try {
    const decoded: any = verifyToken(token);

    // ===============================
    // Admin-only protection
    // ===============================

    if (
      pathname.startsWith("/admin") &&
      decoded.role !== "admin"
    ) {
      return NextResponse.redirect(
        new URL("/dashboard", req.url)
      );
    }

    return NextResponse.next();

  } catch {
    return NextResponse.redirect(
      new URL("/login", req.url)
    );
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/upload/:path*",
    "/run-campaign/:path*",
    "/slots/:path*",
    "/global-search/:path*",
    "/failed-campaign/:path*",
    "/admin/:path*",
    "/change-password/:path*",
    "/login",
    "/forgot-password",
    "/reset-password",
  ],
};
