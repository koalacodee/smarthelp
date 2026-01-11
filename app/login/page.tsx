import LoginForm from "./components/LoginFrom";
import { getLocale, getLanguage } from "@/locales/helpers";

export default async function LoginPage() {
  const [locale, language] = await Promise.all([
    getLocale(),
    getLanguage(),
  ]);

  return <LoginForm locale={locale} language={language} />;
}
