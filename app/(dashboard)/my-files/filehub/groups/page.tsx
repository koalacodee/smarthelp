import { getLocale, getLanguage } from "@/locales/helpers";
import GroupsPageClient from "./page-client";

export default async function GroupsPage() {
  const [locale, language] = await Promise.all([
    getLocale(),
    getLanguage(),
  ]);

  return <GroupsPageClient locale={locale} language={language} />;
}
