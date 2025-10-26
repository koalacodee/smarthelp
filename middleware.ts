// middleware.ts
import { env } from "next-runtime-env";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const excludedPages = [
  "/login",
  "/register/supervisor",
  "/register/employee",
  "/password-reset",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Inject custom header in all requests
  const headers = new Headers(request.headers);
  headers.set("x-current-path", pathname);

  // Skip auth check for excluded pages or attachment pages
  const isAttachmentPage = pathname.startsWith("/a");
  const isExcludedPage = excludedPages.includes(pathname);

  if (!isExcludedPage && !isAttachmentPage) {
    const url = `${env("NEXT_PUBLIC_API_URL")}/auth/refresh`;
    const cookie = request.headers.get("cookie");

    try {
      // Attempt to refresh token
      const apiResponse = await fetch(url, {
        method: "POST",
        headers: cookie ? { cookie } : {},
      });

      if (!apiResponse.ok) {
        // If refresh fails, redirect to login
        return NextResponse.redirect(new URL("/login", request.url));
      }

      // Parse response to get new token
      const data = await apiResponse.json();
      const accessToken = data?.data?.accessToken;

      // Create response with the next middleware
      const response = NextResponse.next({ headers });

      // Set the access token in a client-accessible cookie
      if (accessToken) {
        // Set cookie with path=/, httpOnly=false so client JS can access it
        response.cookies.set({
          name: "accessToken",
          value: accessToken,
          path: "/",
          httpOnly: false, // Allow client-side access
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        });
      }

      return response;
    } catch (error) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next({ headers });
}

export const config = {
  // Apply on all routes except api, _next, and static files
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
