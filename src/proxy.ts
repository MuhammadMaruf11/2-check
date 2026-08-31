import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage =
      req.nextUrl.pathname.startsWith("/login") ||
      req.nextUrl.pathname.startsWith("/register");
    const role = token?.role;

    if (isAuthPage) {
      if (isAuth) {
        const home =
          role === "ADMIN"
            ? "/admin"
            : role === "AUTHOR"
              ? "/author" 
              : "/user"; 
        return NextResponse.redirect(new URL(home, req.url));
      }
      return null;
    }

    if (!isAuth) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (req.nextUrl.pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/user", req.url));
    }
    if (
      req.nextUrl.pathname.startsWith("/author") &&
      role !== "AUTHOR" &&
      role !== "ADMIN"
    ) {
      return NextResponse.redirect(new URL("/user", req.url));
    }
    // USER and AUTHOR both land in the /user area; only ADMIN is redirected away from it.
    if (req.nextUrl.pathname.startsWith("/user") && role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        if (pathname.startsWith("/login") || pathname.startsWith("/register"))
          return true;
        return !!token;
      },
    },
  },
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/author/:path*",
    "/user/:path*",
    "/login",
    "/register",
  ],
};
