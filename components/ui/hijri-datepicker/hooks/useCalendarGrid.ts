import { getDaysInHijriMonth, hijriToGregorian } from '../utils/hijriUtils';
import type { UseCalendarGridParams, CalendarDay } from '../types';

/**
 * Custom hook for generating calendar grid days
 * @param params - Hook parameters
 * @returns Array of calendar day objects
 */
export function useCalendarGrid({
  calendarType,
  viewingHijriMonth,
  viewingHijriYear,
  viewingGregorianMonth,
  viewingGregorianYear
}: UseCalendarGridParams): CalendarDay[] {
  const generateHijriCalendarDays = (): CalendarDay[] => {
    const daysInMonth = getDaysInHijriMonth(viewingHijriYear, viewingHijriMonth);
    const firstDayGregorian = hijriToGregorian(viewingHijriYear, viewingHijriMonth, 1);
    const startDayOfWeek = firstDayGregorian.getDay();
    
    const days: CalendarDay[] = [];
    
    // Previous month days
    const prevMonth = viewingHijriMonth === 1 ? 12 : viewingHijriMonth - 1;
    const prevYear = viewingHijriMonth === 1 ? viewingHijriYear - 1 : viewingHijriYear;
    const daysInPrevMonth = getDaysInHijriMonth(prevYear, prevMonth);
    
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        month: prevMonth,
        year: prevYear,
        isCurrentMonth: false,
        type: 'hijri'
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        month: viewingHijriMonth,
        year: viewingHijriYear,
        isCurrentMonth: true,
        type: 'hijri'
      });
    }
    
    // Next month days
    const remainingDays = 42 - days.length;
    const nextMonth = viewingHijriMonth === 12 ? 1 : viewingHijriMonth + 1;
    const nextYear = viewingHijriMonth === 12 ? viewingHijriYear + 1 : viewingHijriYear;
    
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        month: nextMonth,
        year: nextYear,
        isCurrentMonth: false,
        type: 'hijri'
      });
    }
    
    return days;
  };

  const generateGregorianCalendarDays = (): CalendarDay[] => {
    const daysInMonth = new Date(viewingGregorianYear, viewingGregorianMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(viewingGregorianYear, viewingGregorianMonth, 1);
    const startDayOfWeek = firstDayOfMonth.getDay();
    
    const days: CalendarDay[] = [];
    
    // Previous month days
    const prevMonth = viewingGregorianMonth === 0 ? 11 : viewingGregorianMonth - 1;
    const prevYear = viewingGregorianMonth === 0 ? viewingGregorianYear - 1 : viewingGregorianYear;
    const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();
    
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        month: prevMonth,
        year: prevYear,
        isCurrentMonth: false,
        type: 'gregorian'
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        month: viewingGregorianMonth,
        year: viewingGregorianYear,
        isCurrentMonth: true,
        type: 'gregorian'
      });
    }
    
    // Next month days
    const remainingDays = 42 - days.length;
    const nextMonth = viewingGregorianMonth === 11 ? 0 : viewingGregorianMonth + 1;
    const nextYear = viewingGregorianMonth === 11 ? viewingGregorianYear + 1 : viewingGregorianYear;
    
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        month: nextMonth,
        year: nextYear,
        isCurrentMonth: false,
        type: 'gregorian'
      });
    }
    
    return days;
  };

  // Return appropriate calendar days based on type
  if (calendarType === 'hijri') {
    return generateHijriCalendarDays();
  } else {
    return generateGregorianCalendarDays();
  }
}
