"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Locale } from "@/locales/type";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import { AVAILABLE_LOCALES } from "@/locales/type";
import { useRouter } from "next/navigation";
import Cookie from "js-cookie";
interface SettingsPageClientProps {
  locale: Locale;
  language: string;
}

const languageNames: Record<string, string> = {
  en: "English",
  ar: "العربية",
};

export default function SettingsPageClient({
  locale: initialLocale,
  language: initialLanguage,
}: SettingsPageClientProps) {
  const { setLocale } = useLocaleStore();
  const storeLocale = useLocaleStore((state) => state.locale);
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setLocale(initialLocale, initialLanguage);
  }, [initialLocale, initialLanguage, setLocale]);

  if (!storeLocale) return null;

  const handleLanguageChange = (newLanguage: string) => {
    if (newLanguage === selectedLanguage || isUpdating) return;

    setIsUpdating(true);
    try {
      Cookie.set("SMARTHELP_LANG", newLanguage, {
        path: "/",
        expires: 365, // 1 year in days
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
      setSelectedLanguage(newLanguage);
      // router.refresh();
      window.location.reload();
    } catch (error) {
      console.error("Failed to update language:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/30 p-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, ease: "backOut" }}
              className="w-12 h-12 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg"
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                {storeLocale.settings.pageHeader.title}
              </h1>
              <p className="text-slate-600 mt-1">
                {storeLocale.settings.pageHeader.description}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Language Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/30 p-8"
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              {storeLocale.settings.language.title}
            </h2>
            <p className="text-sm text-slate-600">
              {storeLocale.settings.language.description}
            </p>
          </div>

          <div className="space-y-4">
            <label
              htmlFor="language-select"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              {storeLocale.settings.language.selectLabel}
            </label>
            <select
              id="language-select"
              value={selectedLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              disabled={isUpdating}
              className="w-full px-4 py-3 bg-slate-50/50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {AVAILABLE_LOCALES.map((lang) => (
                <option key={lang} value={lang}>
                  {languageNames[lang] || lang}
                </option>
              ))}
            </select>
            {isUpdating && (
              <p className="text-sm text-slate-500 italic">
                {storeLocale.settings.language.updating}
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
