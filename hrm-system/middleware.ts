import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;

    if (req.nextUrl.pathname.startsWith("/admin")) {
      if (token?.role !== "Admin") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }
    if (req.nextUrl.pathname.startsWith("/organization")) {
      if (token?.role !== "Admin") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }
    if (req.nextUrl.pathname.startsWith("/hr")) {
      if (token?.role !== "HR" && token?.role !== "Admin") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }
    if (req.nextUrl.pathname.startsWith("/manager")) {
      if (token?.role !== "Manager" && token?.role !== "Admin") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }
    if (req.nextUrl.pathname.startsWith("/salaries/employee")) {
      if (token?.role !== "HR" && token?.role !== "Admin") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }): boolean => !!token,
    },
    pages: {
      signIn: "/auth/login",
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/admin/:path*",
    "/organization/:path*",
    "/hr/:path*",
    "/manager/:path*",
    "/employees/:path*",
    "/projects/:path*",
    "/timesheet/:path*",
  ],
};
