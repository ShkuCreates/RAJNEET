import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith("/login");
    const isOnboardingPage = req.nextUrl.pathname.startsWith("/onboarding");
    const isProfilePage = req.nextUrl.pathname.startsWith("/profile");
    const isAdminPage = req.nextUrl.pathname.startsWith("/admin");

    // If authenticated but missing onboarding_complete, force onboarding (except for onboarding itself)
    if (isAuth) {
      const isOnboardingComplete = token.onboarding_complete;
      
      if (!isOnboardingComplete && !isOnboardingPage) {
        return NextResponse.redirect(new URL("/onboarding", req.url));
      }
      if (isOnboardingComplete && isOnboardingPage) {
        return NextResponse.redirect(new URL("/", req.url));
      }

      // Admin check
      if (isAdminPage && token.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    // If NOT logged in and trying to access profile or admin
    if (!isAuth && (isProfilePage || isAdminPage)) {
      let from = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }
      return NextResponse.redirect(
        new URL(`/login?from=${encodeURIComponent(from)}`, req.url)
      );
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
  matcher: ["/", "/admin/:path*", "/onboarding", "/login", "/profile"],
};
