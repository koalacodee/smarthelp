import type { HijriDate, Language } from '../types';

// Hijri calendar conversion utilities

export const HIJRI_MONTHS: readonly string[] = [
  'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
  'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Shaban',
  'Ramadan', 'Shawwal', 'Dhul Qadah', 'Dhul Hijjah'
] as const;

export const HIJRI_MONTHS_AR: readonly string[] = [
  'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
  'جمادى الأولى', 'جمادى الثانية', 'رجب', 'شعبان',
  'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
] as const;

export const GREGORIAN_MONTHS: readonly string[] = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
] as const;

export const GREGORIAN_MONTHS_AR: readonly string[] = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
] as const;

export const DAY_NAMES_EN: readonly string[] = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;
export const DAY_NAMES_AR: readonly string[] = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'] as const;

/**
 * Convert Gregorian date to Hijri date
 * @param gregorianDate - JavaScript Date object
 * @returns Hijri date object
 */
export function gregorianToHijri(gregorianDate: Date): HijriDate {
  const g = new Date(gregorianDate);
  const gYear = g.getFullYear();
  const gMonth = g.getMonth();
  const gDay = g.getDate();
  
  // Julian day calculation
  const a = Math.floor((14 - (gMonth + 1)) / 12);
  const y = gYear + 4800 - a;
  const m = (gMonth + 1) + 12 * a - 3;
  const jd = gDay + Math.floor((153 * m + 2) / 5) + 365 * y + 
           Math.floor(y / 4) - Math.floor(y / 100) + 
           Math.floor(y / 400) - 32045;
  
  // Convert Julian to Hijri
  let l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  const j = (Math.floor((10985 - l) / 5316)) * 
          (Math.floor((50 * l) / 17719)) + 
          (Math.floor(l / 5670)) * 
          (Math.floor((43 * l) / 15238));
  l = l - (Math.floor((30 - j) / 15)) * 
      (Math.floor((17719 * j) / 50)) - 
      (Math.floor(j / 16)) * 
      (Math.floor((15238 * j) / 43)) + 29;
  
  const hMonth = Math.floor((24 * l) / 709);
  const hDay = l - Math.floor((709 * hMonth) / 24);
  const hYear = 30 * n + j - 30;
  
  return { year: hYear, month: hMonth, day: hDay };
}

/**
 * Convert Hijri date to Gregorian date
 * @param hYear - Hijri year
 * @param hMonth - Hijri month (1-12)
 * @param hDay - Hijri day
 * @returns JavaScript Date object
 */
export function hijriToGregorian(hYear: number, hMonth: number, hDay: number): Date {
  // Convert Hijri to Julian
  const jd = Math.floor((11 * hYear + 3) / 30) + 
           354 * hYear + 30 * hMonth - 
           Math.floor((hMonth - 1) / 2) + hDay + 1948440 - 385;
  
  // Convert Julian to Gregorian
  const a = jd + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  
  const gDay = e - Math.floor((153 * m + 2) / 5) + 1;
  const gMonth = m + 3 - 12 * Math.floor(m / 10);
  const gYear = 100 * b + d - 4800 + Math.floor(m / 10);
  
  return new Date(gYear, gMonth - 1, gDay);
}

/**
 * Get number of days in a Hijri month
 * @param year - Hijri year
 * @param month - Hijri month (1-12)
 * @returns Number of days (29 or 30)
 */
export function getDaysInHijriMonth(year: number, month: number): number {
  // Alternating 30/29 day months with adjustments
  if (month % 2 === 1) return 30;
  if (month === 12 && isHijriLeapYear(year)) return 30;
  return 29;
}

/**
 * Check if a Hijri year is a leap year
 * @param year - Hijri year
 * @returns true if leap year
 */
export function isHijriLeapYear(year: number): boolean {
  return (11 * year + 14) % 30 < 11;
}

/**
 * Check if a date is Friday
 * @param date - JavaScript Date object
 * @returns true if Friday
 */
export function isFriday(date: Date): boolean {
  return date.getDay() === 5;
}

/**
 * Format Hijri date
 * @param hijriDate - Hijri date object
 * @param language - 'en' or 'ar'
 * @returns Formatted date string
 */
export function formatHijriDate(hijriDate: HijriDate, language: Language = 'en'): string {
  const months = language === 'ar' ? HIJRI_MONTHS_AR : HIJRI_MONTHS;
  return `${hijriDate.day} ${months[hijriDate.month - 1]} ${hijriDate.year}`;
}

/**
 * Format Gregorian date
 * @param date - JavaScript Date object
 * @param language - 'en' or 'ar'
 * @returns Formatted date string
 */
export function formatGregorianDate(date: Date, language: Language = 'en'): string {
  return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
