import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getIronSession } from "iron-session";
import { env } from "next-runtime-env";
import { UserResponse } from "@/lib/api";
import ProfilePageClient from "./components/ProfilePageClient";
import { getLocale, getLanguage } from "@/locales/helpers";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const session = await getIronSession<{ user?: UserResponse }>(cookieStore, {
    password: env("NEXT_PUBLIC_AUTH_SECRET")!,
    cookieName: "user_session",
    cookieOptions: {
      maxAge: undefined,
      httpOnly: true,
      secure: env("NODE_ENV") === "production",
      sameSite: "lax",
    },
  });

  const user = session.user;

  if (!user) {
    redirect("/login");
  }

  const [locale, language] = await Promise.all([
    getLocale(),
    getLanguage(),
  ]);

  return <ProfilePageClient user={user} locale={locale} language={language} />;
}

