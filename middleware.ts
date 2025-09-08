// middleware.ts
import { env } from "next-runtime-env";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Inject custom header in all requests
  const headers = new Headers(request.headers);
  headers.set("x-current-path", pathname);

  // Skip auth check for login page
  if (pathname !== "/login") {
    const url = `${env("NEXT_PUBLIC_API_URL")}/auth/refresh`;
    const cookie = request.headers.get("cookie");

    // fetch response
    const apiResponse = await fetch(url, {
      method: "POST",
      headers: cookie ? { cookie } : {},
    });

    // parse body separately
    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // ممكن هنا تستخدم data لو عايز
    console.log("refresh response:", data);
  }

  return NextResponse.next({ headers });
}

export const config = {
  // Apply on all routes except api, _next, and static files
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
