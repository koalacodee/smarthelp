import React from "react";
import { useDatePicker } from "./hooks/useDatePicker";
import { useCalendarGrid } from "./hooks/useCalendarGrid";
import { DatePickerHeader } from "./components/DatePickerHeader";
import { CalendarBody } from "./components/CalendarBody";
import { InfoNote } from "./components/InfoNote";
import type { HijriDatePickerProps } from "./types";

/**
 * Main Hijri Date Picker Component
 */
const HijriDatePicker: React.FC<HijriDatePickerProps> = ({
  onDateChange = () => {},
  initialDate = new Date(),
  defaultCalendar = "hijri",
  defaultLanguage = "en",
}) => {
  // Use custom hooks for state management
  const {
    calendarType,
    language,
    selectedHijri,
    selectedGregorian,
    viewingHijriMonth,
    viewingHijriYear,
    viewingGregorianMonth,
    viewingGregorianYear,
    selectDate,
    nextMonth,
    prevMonth,
    switchCalendarType,
    toggleLanguage,
    goToToday,
    isToday,
    isSelected,
  } = useDatePicker({
    initialDate,
    defaultCalendar,
    defaultLanguage,
    onDateChange,
  });

  // Generate calendar grid days
  const calendarDays = useCalendarGrid({
    calendarType,
    viewingHijriMonth,
    viewingHijriYear,
    viewingGregorianMonth,
    viewingGregorianYear,
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        fontFamily: '"Noto Kufi Arabic", "Segoe UI", system-ui, sans-serif',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;500;600;700&family=Amiri:wght@400;700&display=swap');
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        
        .calendar-enter {
          animation: slideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .day-cell {
          transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .day-cell:hover {
          transform: scale(1.1);
        }
        
        .islamic-pattern {
          background-image: 
            radial-gradient(circle at 20% 50%, rgba(255, 215, 0, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255, 215, 0, 0.03) 0%, transparent 50%);
        }
      `}</style>

      <div
        style={{
          maxWidth: "450px",
          width: "100%",
        }}
      >
        {/* Header */}
        <DatePickerHeader
          calendarType={calendarType}
          language={language}
          selectedHijri={selectedHijri}
          selectedGregorian={selectedGregorian}
          onLanguageToggle={toggleLanguage}
          onCalendarTypeSwitch={switchCalendarType}
        />

        {/* Calendar Body */}
        <CalendarBody
          calendarType={calendarType}
          language={language}
          viewingHijriMonth={viewingHijriMonth}
          viewingHijriYear={viewingHijriYear}
          viewingGregorianMonth={viewingGregorianMonth}
          viewingGregorianYear={viewingGregorianYear}
          calendarDays={calendarDays}
          onPrevMonth={prevMonth}
          onNextMonth={nextMonth}
          onSelectDate={selectDate}
          onGoToToday={goToToday}
          isToday={isToday}
          isSelected={isSelected}
        />

        {/* Info Note */}
        <InfoNote calendarType={calendarType} language={language} />
      </div>
    </div>
  );
};

export default HijriDatePicker;
