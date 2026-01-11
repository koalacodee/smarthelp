import { create } from "zustand";
import { Locale } from "@/locales/type";

export interface LocaleState {
  locale: Locale | null;
  language: string;
  setLocale: (locale: Locale, language: string) => void;
}

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: null,
  language: "en",
  setLocale: (locale, language) => set({ locale, language }),
}));
