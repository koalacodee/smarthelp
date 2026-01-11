import { dateToHijri } from "./hijri";

/**
 * Formats a date with optional Hijri date display when language is Arabic
 * @param date - Date string, Date object, null, or undefined
 * @param language - Current language code ("ar" or "en")
 * @param options - Optional Intl.DateTimeFormatOptions for Gregorian date formatting
 * @param fallback - Fallback text when date is invalid/null (default: "")
 * @returns Formatted date string with Hijri date if language is Arabic
 */
export function formatDateWithHijri(
  date: string | Date | null | undefined,
  language: string,
  options?: Intl.DateTimeFormatOptions,
  fallback: string = ""
): string {
  if (!date) return fallback;

  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return fallback;

  // Format Gregorian date
  const gregorianDate = d.toLocaleDateString(
    language === "ar" ? "ar-SA" : "en-US",
    options
  );

  // If Arabic, add Hijri date
  if (language === "ar") {
    const hijriDate = dateToHijri(d);
    return `${gregorianDate} (${hijriDate})`;
  }

  return gregorianDate;
}

/**
 * Formats a date with time, including optional Hijri date when language is Arabic
 * @param date - Date string, Date object, null, or undefined
 * @param language - Current language code ("ar" or "en")
 * @param dateOptions - Optional Intl.DateTimeFormatOptions for date formatting
 * @param timeOptions - Optional Intl.DateTimeFormatOptions for time formatting
 * @param fallback - Fallback text when date is invalid/null (default: "")
 * @returns Formatted date and time string with Hijri date if language is Arabic
 */
export function formatDateTimeWithHijri(
  date: string | Date | null | undefined,
  language: string,
  dateOptions?: Intl.DateTimeFormatOptions,
  timeOptions?: Intl.DateTimeFormatOptions,
  fallback: string = ""
): string {
  if (!date) return fallback;

  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return fallback;

  // Format Gregorian date
  const gregorianDate = d.toLocaleDateString(
    language === "ar" ? "ar-SA" : "en-US",
    dateOptions
  );
  const gregorianTime = d.toLocaleTimeString(
    language === "ar" ? "ar-SA" : "en-US",
    timeOptions
  );

  // If Arabic, add Hijri date
  if (language === "ar") {
    const hijriDate = dateToHijri(d);
    return `${gregorianDate} ${gregorianTime} (${hijriDate})`;
  }

  return `${gregorianDate} ${gregorianTime}`;
}

/**
 * Formats a date in short format (month: "short", day: "numeric") with optional Hijri date
 * @param date - Date string, Date object, null, or undefined
 * @param language - Current language code ("ar" or "en")
 * @param fallback - Fallback text when date is invalid/null (default: "")
 * @returns Formatted short date string with Hijri date if language is Arabic
 */
export function formatDateShort(
  date: string | Date | null | undefined,
  language: string,
  fallback: string = ""
): string {
  return formatDateWithHijri(
    date,
    language,
    { month: "short", day: "numeric" },
    fallback
  );
}

/**
 * Formats a date for display (default locale formatting) with optional Hijri date
 * @param date - Date string, Date object, null, or undefined
 * @param language - Current language code ("ar" or "en")
 * @param fallback - Fallback text when date is invalid/null (default: "No expiration")
 * @returns Formatted date string with Hijri date if language is Arabic
 */
export function formatDateDisplay(
  date: string | Date | null | undefined,
  language: string,
  fallback: string = "No expiration"
): string {
  if (!date) return fallback;
  return formatDateWithHijri(date, language, undefined, fallback);
}
