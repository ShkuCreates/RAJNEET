import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith("/login");
    const isLandingPage = req.nextUrl.pathname === "/";

    // If logged in and on landing or login page, send to dashboard
    if (isAuth && (isAuthPage || isLandingPage)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // If NOT logged in and trying to access protected routes
    if (!isAuth && !isAuthPage && !isLandingPage) {
      let from = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }
      return NextResponse.redirect(
        new URL(`/login?from=${encodeURIComponent(from)}`, req.url)
      );
    }
    
    // If authenticated but missing state/district, force onboarding (except for onboarding itself)
    if (isAuth) {
      const hasLocation = token.state && token.district;
      const isOnboarding = req.nextUrl.pathname.startsWith("/onboarding");
      
      if (!hasLocation && !isOnboarding) {
        return NextResponse.redirect(new URL("/onboarding", req.url));
      }
      if (hasLocation && isOnboarding) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      // Admin check
      if (req.nextUrl.pathname.startsWith("/admin") && token.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true, // Let the middleware function handle the logic
    },
  }
);

export const config = {
  matcher: ["/", "/dashboard/:path*", "/admin/:path*", "/onboarding", "/login"],
};
