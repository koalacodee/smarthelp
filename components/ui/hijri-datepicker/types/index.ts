/**
 * Hijri date object structure
 */
export interface HijriDate {
  year: number;
  month: number;
  day: number;
}

/**
 * Calendar day object for grid display
 */
export interface CalendarDay {
  day: number;
  month: number;
  year: number;
  isCurrentMonth: boolean;
  type: CalendarType;
}

/**
 * Calendar type enum
 */
export type CalendarType = 'hijri' | 'gregorian';

/**
 * Language type
 */
export type Language = 'en' | 'ar';

/**
 * Main component props
 */
export interface HijriDatePickerProps {
  onDateChange?: (date: Date) => void;
  initialDate?: Date;
  defaultCalendar?: CalendarType;
  defaultLanguage?: Language;
}

/**
 * Date picker hook configuration
 */
export interface UseDatePickerConfig {
  initialDate?: Date;
  defaultCalendar?: CalendarType;
  defaultLanguage?: Language;
  onDateChange?: (date: Date) => void;
}

/**
 * Date picker hook return value
 */
export interface UseDatePickerReturn {
  calendarType: CalendarType;
  language: Language;
  selectedHijri: HijriDate;
  selectedGregorian: Date;
  viewingHijriMonth: number;
  viewingHijriYear: number;
  viewingGregorianMonth: number;
  viewingGregorianYear: number;
  todayHijri: HijriDate;
  todayGregorian: Date;
  selectDate: (day: number, month: number, year: number, type: CalendarType) => void;
  nextMonth: () => void;
  prevMonth: () => void;
  switchCalendarType: () => void;
  toggleLanguage: () => void;
  goToToday: () => void;
  isToday: (day: number, month: number, year: number, type: CalendarType) => boolean;
  isSelected: (day: number, month: number, year: number, type: CalendarType) => boolean;
}

/**
 * Calendar grid hook params
 */
export interface UseCalendarGridParams {
  calendarType: CalendarType;
  viewingHijriMonth: number;
  viewingHijriYear: number;
  viewingGregorianMonth: number;
  viewingGregorianYear: number;
}

/**
 * Header component props
 */
export interface DatePickerHeaderProps {
  calendarType: CalendarType;
  language: Language;
  selectedHijri: HijriDate;
  selectedGregorian: Date;
  onLanguageToggle: () => void;
  onCalendarTypeSwitch: () => void;
}

/**
 * Month navigation props
 */
export interface MonthNavigationProps {
  calendarType: CalendarType;
  language: Language;
  viewingHijriMonth: number;
  viewingHijriYear: number;
  viewingGregorianMonth: number;
  viewingGregorianYear: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

/**
 * Day header props
 */
export interface DayHeaderProps {
  language: Language;
}

/**
 * Calendar grid props
 */
export interface CalendarGridProps {
  calendarDays: CalendarDay[];
  language: Language;
  onSelectDate: (day: number, month: number, year: number, type: CalendarType) => void;
  isToday: (day: number, month: number, year: number, type: CalendarType) => boolean;
  isSelected: (day: number, month: number, year: number, type: CalendarType) => boolean;
}

/**
 * Day cell props
 */
export interface DayCellProps {
  dateObj: CalendarDay;
  isToday: boolean;
  isSelected: boolean;
  onSelect: () => void;
}

/**
 * Calendar body props
 */
export interface CalendarBodyProps {
  calendarType: CalendarType;
  language: Language;
  viewingHijriMonth: number;
  viewingHijriYear: number;
  viewingGregorianMonth: number;
  viewingGregorianYear: number;
  calendarDays: CalendarDay[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDate: (day: number, month: number, year: number, type: CalendarType) => void;
  onGoToToday: () => void;
  isToday: (day: number, month: number, year: number, type: CalendarType) => boolean;
  isSelected: (day: number, month: number, year: number, type: CalendarType) => boolean;
}

/**
 * Info note props
 */
export interface InfoNoteProps {
  calendarType: CalendarType;
  language: Language;
}
