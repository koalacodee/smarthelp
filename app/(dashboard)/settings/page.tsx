import { Metadata } from "next";
import { getLocale, getLanguage } from "@/locales/helpers";
import SettingsPageClient from "./components/SettingsPageClient";

export const metadata: Metadata = {
  title: "Settings | SmartHelp",
  description: "Manage your application settings",
};

export default async function SettingsPage() {
  const [locale, language] = await Promise.all([
    getLocale(),
    getLanguage(),
  ]);

  return <SettingsPageClient locale={locale} language={language} />;
}
