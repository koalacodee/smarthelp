import { SupportedLanguage } from "@/types/translation";

export const TRANSLATION_MAP = {
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  ar: "العربية",
  pt: "Português",
  ru: "Русский",
  zh: "简体中文",
  ja: "日本語",
  tr: "Türkçe",
} as const satisfies Record<SupportedLanguage, string>;
