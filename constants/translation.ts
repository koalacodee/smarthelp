import { SupportedLanguage } from "@/types/translation";

export const TRANSLATION_MAP = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  ar: "Arabic",
  pt: "Portuguese",
  ru: "Russian",
  zh: "Chinese (Simplified)",
  ja: "Japanese",
  tr: "Turkish",
} as const satisfies Record<SupportedLanguage, string>;
