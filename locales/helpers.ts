import { headers } from "next/headers";
import { AVAILABLE_LOCALES, Locale } from "./type";

export async function getLanguage(): Promise<string> {
  const lang = await headers()
    .then((hdrs) => hdrs.get("x-lang") || "en")
    .then((l) => (AVAILABLE_LOCALES.includes(l) ? l : "en"));
  return lang;
}

export async function getLocale(): Promise<Locale> {
  const lang = await getLanguage();
  const locale = await import(`@/locales/${lang}.json`).then(
    (mod) => mod.default
  );
  return locale;
}
