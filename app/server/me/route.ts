import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { env } from "next-runtime-env";
import api, { UserResponse } from "@/lib/api";

export async function GET() {
  const cookieStore = await cookies();
  const session = await getIronSession<{ user?: UserResponse }>(cookieStore, {
    password: env("NEXT_PUBLIC_AUTH_SECRET")!,
    cookieName: "user_session",
  });

  console.log(cookieStore);

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
