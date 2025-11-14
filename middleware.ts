// middleware.ts
import { env } from "next-runtime-env";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { EmployeePermissions } from "@/lib/api/types";
import { SupervisorPermissions } from "@/lib/api/supervisors";
import api, { UserResponse } from "@/lib/api";
import { getIronSession } from "iron-session";
// Helper function to find matching route for nested paths
// Prioritizes more specific routes (longer paths) over general ones
function findMatchingRoute(
  pathname: string,
  routes: Record<string, (r: string, p: string[]) => boolean>
): ((r: string, p: string[]) => boolean) | undefined {
  // First try exact match
  if (routes[pathname]) {
    return routes[pathname];
  }

  // Sort routes by path length (longest first) to prioritize specific routes
  const sortedRoutes = Object.keys(routes)
    .filter((route) => pathname.startsWith(route))
    .sort((a, b) => b.length - a.length);

  // Return the longest matching route (most specific)
  if (sortedRoutes.length > 0) {
    return routes[sortedRoutes[0]];
  }

  return undefined;
}

const pageAccess: Record<string, (r: string, p: string[]) => boolean> = {
  // Analytics And Insights
  "/": (r, p) =>
    r === "ADMIN" || p.includes(SupervisorPermissions.VIEW_ANALYTICS),

  // FAQs & Categories
  "/faqs": (r, p) =>
    r === "ADMIN" ||
    r === "SUPERVISOR" ||
    (r === "EMPLOYEE" && p.includes(EmployeePermissions.ADD_FAQS)),

  // Categories (Department)
  "/department": (r) => r === "ADMIN" || r === "SUPERVISOR",

  // Tickets
  "/tickets": (r, p) =>
    r !== "EMPLOYEE" || p.includes(EmployeePermissions.HANDLE_TICKETS),

  // Tasks
  "/tasks": (r, p) =>
    r === "ADMIN" ||
    (r === "SUPERVISOR" && p.includes(SupervisorPermissions.MANAGE_TASKS)) ||
    (r === "EMPLOYEE" && p.includes(EmployeePermissions.HANDLE_TASKS)),

  // My Tasks
  "/tasks/my-tasks": (r, p) =>
    r !== "EMPLOYEE" ||
    (r === "EMPLOYEE" && p.includes(EmployeePermissions.HANDLE_TASKS)),

  // Manage Team
  "/manage-team": (r) => r !== "EMPLOYEE",

  // Promotions
  "/promotions": (r, p) =>
    r === "ADMIN" || p.includes(SupervisorPermissions.MANAGE_PROMOTIONS),

  // Supervisors
  "/supervisors": (r) => r === "ADMIN",

  // User Activity
  "/user-activity": (r, p) =>
    r === "ADMIN" || p.includes(SupervisorPermissions.VIEW_USER_ACTIVITY),

  // Knowledge Chunks
  "/knowledge-chunks": (r) => r === "ADMIN",

  // My Files (accessible to all users)
  "/files": () => true,
};
const excludedPages = [
  "/login",
  "/register/supervisor",
  "/register/employee",
  "/password-reset",
  "/server/me",
];

const extractSessionCookie = async (response: NextResponse, accessToken: string, apiUrl: string) => {
  const session = await getIronSession<{ user?: UserResponse }>(response.cookies, {
    password: env("NEXT_PUBLIC_AUTH_SECRET")!,
    cookieName: "user_session",
    cookieOptions: {
      maxAge: undefined, // Session cookie expires on browser close
      httpOnly: true,
      secure: env("NODE_ENV") === "production",
      sameSite: "lax",
    },
  });

  let user = session.user ?? null;

  if (!user) {
    const response = await fetch(`${apiUrl}/auth/me`, {
      method: "GET",
      headers: {
        "Authorization": accessToken ? `Bearer ${accessToken}` : "",
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to get current user: ${response.statusText}`);
    }

    const data = await response.json().then((data) => data.data as UserResponse);

    if (response) {
      user = data;
      session.user = data;
      await session.save();
    }
  }

  return user;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Inject custom header in all requests
  const headers = new Headers(request.headers);
  headers.set("x-current-path", pathname);
  console.log("pathname", pathname);

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

        const user = await extractSessionCookie(response, accessToken, env("NEXT_PUBLIC_API_URL") || "")
        console.log("user", user);
        const allowed = pathname ? findMatchingRoute(pathname, pageAccess) : undefined;
        console.log(allowed);
        let notAllowed = false;

        if (allowed && user && !allowed(user.role, user.permissions ?? [])) {
          notAllowed = true;
        }

        if (notAllowed) {
          return NextResponse.redirect(new URL("/access-denied", request.url))
        }
      }

      return response;
    } catch (error) {
      console.log(error);

      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next({ headers });
}

export const config = {
  // Apply on all routes except api, _next, and static files
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
