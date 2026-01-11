import PasswordResetForm from "./components/PasswordResetForm";
import { getLocale, getLanguage } from "@/locales/helpers";

export default async function PasswordResetPage() {
  const [locale, language] = await Promise.all([
    getLocale(),
    getLanguage(),
  ]);

  return <PasswordResetForm locale={locale} language={language} />;
}
