export const RTL_LANGUAGES: Set<string> = new Set([
  "ar", // Arabic
  "he", // Hebrew
  "fa", // Persian (Farsi)
  "ur", // Urdu
  "ps", // Pashto
  "sd", // Sindhi
  "ckb", // Central Kurdish (Sorani)
  "prs", // Dari (Afghan Persian)
  "yi", // Yiddish
]);

export function isRTL(lang: string) {
  return RTL_LANGUAGES.has(lang);
}
