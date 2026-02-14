import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { env } from "next-runtime-env";
import { getLocale, getLanguage } from "@/locales/helpers";
import MyDelegationsHydrator from "./_components/MyDelegationsHydrator";
import { Provider } from "../provider";

export default async function Page() {
  const cookieStore = await cookies();
  const user = await fetch(`${env("NEXT_PUBLIC_BASE_URL")}/server/me`, {
    headers: { Cookie: cookieStore.toString() },
  }).then((res) => res.json());

  const userRole = user.user?.role as string;

  if (userRole !== "SUPERVISOR") {
    redirect("/v2/tasks/my-tasks");
  }

  const [locale, language] = await Promise.all([
    getLocale(),
    getLanguage(),
  ]);

  return (
    <Provider>
      <MyDelegationsHydrator locale={locale} language={language} />
    </Provider>
  );
}

export const revalidate = 1;
