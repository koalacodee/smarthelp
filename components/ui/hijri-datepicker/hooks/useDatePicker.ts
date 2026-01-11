import { useState } from 'react';
import { gregorianToHijri, hijriToGregorian } from '../utils/hijriUtils';
import type { 
  UseDatePickerConfig, 
  UseDatePickerReturn, 
  CalendarType, 
  HijriDate 
} from '../types';

/**
 * Custom hook for managing date picker state
 * @param config - Configuration object
 * @returns State and methods
 */
export function useDatePicker({
  initialDate = new Date(),
  defaultCalendar = 'hijri',
  defaultLanguage = 'en',
  onDateChange = () => {}
}: UseDatePickerConfig): UseDatePickerReturn {
  const today = new Date();
  const todayHijri = gregorianToHijri(today);
  const todayGregorian = today;
  
  // Calendar type and language
  const [calendarType, setCalendarType] = useState<CalendarType>(defaultCalendar);
  const [language, setLanguage] = useState<'en' | 'ar'>(defaultLanguage);
  
  // Hijri state
  const initialHijri = gregorianToHijri(initialDate);
  const [selectedHijri, setSelectedHijri] = useState<HijriDate>(initialHijri);
  const [viewingHijriMonth, setViewingHijriMonth] = useState<number>(initialHijri.month);
  const [viewingHijriYear, setViewingHijriYear] = useState<number>(initialHijri.year);
  
  // Gregorian state
  const [selectedGregorian, setSelectedGregorian] = useState<Date>(initialDate);
  const [viewingGregorianMonth, setViewingGregorianMonth] = useState<number>(initialDate.getMonth());
  const [viewingGregorianYear, setViewingGregorianYear] = useState<number>(initialDate.getFullYear());

  /**
   * Select a date
   */
  const selectDate = (day: number, month: number, year: number, type: CalendarType): void => {
    let dateObject: Date;
    
    if (type === 'hijri') {
      setSelectedHijri({ day, month, year });
      dateObject = hijriToGregorian(year, month, day);
      setSelectedGregorian(dateObject);
    } else {
      dateObject = new Date(year, month, day);
      setSelectedGregorian(dateObject);
      const hijriDate = gregorianToHijri(dateObject);
      setSelectedHijri(hijriDate);
    }
    
    onDateChange(dateObject);
  };

  /**
   * Navigate to next month
   */
  const nextMonth = (): void => {
    if (calendarType === 'hijri') {
      if (viewingHijriMonth === 12) {
        setViewingHijriMonth(1);
        setViewingHijriYear(viewingHijriYear + 1);
      } else {
        setViewingHijriMonth(viewingHijriMonth + 1);
      }
    } else {
      if (viewingGregorianMonth === 11) {
        setViewingGregorianMonth(0);
        setViewingGregorianYear(viewingGregorianYear + 1);
      } else {
        setViewingGregorianMonth(viewingGregorianMonth + 1);
      }
    }
  };

  /**
   * Navigate to previous month
   */
  const prevMonth = (): void => {
    if (calendarType === 'hijri') {
      if (viewingHijriMonth === 1) {
        setViewingHijriMonth(12);
        setViewingHijriYear(viewingHijriYear - 1);
      } else {
        setViewingHijriMonth(viewingHijriMonth - 1);
      }
    } else {
      if (viewingGregorianMonth === 0) {
        setViewingGregorianMonth(11);
        setViewingGregorianYear(viewingGregorianYear - 1);
      } else {
        setViewingGregorianMonth(viewingGregorianMonth - 1);
      }
    }
  };

  /**
   * Switch between Hijri and Gregorian calendar
   */
  const switchCalendarType = (): void => {
    const newType: CalendarType = calendarType === 'hijri' ? 'gregorian' : 'hijri';
    setCalendarType(newType);
    
    // Sync viewing month/year when switching
    if (newType === 'gregorian') {
      const gregorianDate = hijriToGregorian(viewingHijriYear, viewingHijriMonth, 15);
      setViewingGregorianMonth(gregorianDate.getMonth());
      setViewingGregorianYear(gregorianDate.getFullYear());
    } else {
      const hijriDate = gregorianToHijri(new Date(viewingGregorianYear, viewingGregorianMonth, 15));
      setViewingHijriMonth(hijriDate.month);
      setViewingHijriYear(hijriDate.year);
    }
  };

  /**
   * Toggle language
   */
  const toggleLanguage = (): void => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  /**
   * Go to today's date
   */
  const goToToday = (): void => {
    const today = new Date();
    const todayHijri = gregorianToHijri(today);
    
    setSelectedGregorian(today);
    setSelectedHijri(todayHijri);
    setViewingGregorianMonth(today.getMonth());
    setViewingGregorianYear(today.getFullYear());
    setViewingHijriMonth(todayHijri.month);
    setViewingHijriYear(todayHijri.year);
    
    onDateChange(today);
  };

  /**
   * Check if a date is today
   */
  const isToday = (day: number, month: number, year: number, type: CalendarType): boolean => {
    if (type === 'hijri') {
      return day === todayHijri.day && month === todayHijri.month && year === todayHijri.year;
    } else {
      const compareDate = new Date(year, month, day);
      return compareDate.toDateString() === todayGregorian.toDateString();
    }
  };

  /**
   * Check if a date is selected
   */
  const isSelected = (day: number, month: number, year: number, type: CalendarType): boolean => {
    if (type === 'hijri') {
      return day === selectedHijri.day && month === selectedHijri.month && year === selectedHijri.year;
    } else {
      const compareDate = new Date(year, month, day);
      return compareDate.toDateString() === selectedGregorian.toDateString();
    }
  };

  return {
    // State
    calendarType,
    language,
    selectedHijri,
    selectedGregorian,
    viewingHijriMonth,
    viewingHijriYear,
    viewingGregorianMonth,
    viewingGregorianYear,
    todayHijri,
    todayGregorian,
    
    // Methods
    selectDate,
    nextMonth,
    prevMonth,
    switchCalendarType,
    toggleLanguage,
    goToToday,
    isToday,
    isSelected
  };
}
