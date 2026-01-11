import { getLocale, getLanguage } from "@/locales/helpers";
import FileHubPageClient from "./page-client";

export default async function FileHubPage() {
  const [locale, language] = await Promise.all([
    getLocale(),
    getLanguage(),
  ]);

  return <FileHubPageClient locale={locale} language={language} />;
}
