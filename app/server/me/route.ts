import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { env } from "next-runtime-env";
import api, { UserResponse } from "@/lib/api";
import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

export async function GET(request: NextRequest) {
  const cookieStore = request.cookies;
  const session = await getIronSession<{ user?: UserResponse }>(
    {
      get(name) {
        return { name, value: cookieStore.get(name)?.value ?? "" };
      },
      set(
        nameOrOptions: string | ResponseCookie,
        value?: string,
        options?: Partial<ResponseCookie>,
      ) {
        if (typeof nameOrOptions === "string") {
          if (value) {
            cookieStore.set(nameOrOptions, value);
          }
        } else {
          cookieStore.set(nameOrOptions);
        }
      },
    },
    {
      password: env("NEXT_PUBLIC_AUTH_SECRET")!,
      cookieName: "user_session",
      cookieOptions: {
        maxAge: undefined, // Session cookie expires on browser close
        httpOnly: true,
        secure: env("NODE_ENV") === "production",
        sameSite: "lax",
      },
    },
  );

  let user = session.user ?? null;

  if (!user) {
    const response = await api.authService.getCurrentUser();

    if (response) {
      const data = response;
      user = data;
      session.user = data;
      await session.save();
    }
  }

  return NextResponse.json({ user });
}
