import React from "react";
import { MonthNavigation } from "./MonthNavigation";
import { DayHeader } from "./DayHeader";
import { CalendarGrid } from "./CalendarGrid";
import type { CalendarBodyProps } from "../types";

/**
 * Calendar body component (contains navigation, headers, and grid)
 */
export const CalendarBody: React.FC<CalendarBodyProps> = ({
  calendarType,
  language,
  viewingHijriMonth,
  viewingHijriYear,
  viewingGregorianMonth,
  viewingGregorianYear,
  calendarDays,
  onPrevMonth,
  onNextMonth,
  onSelectDate,
  onGoToToday,
  isToday,
  isSelected,
}) => {
  return (
    <div
      className="islamic-pattern"
      style={{
        background: "rgba(255, 255, 255, 0.98)",
        padding: "1.5rem",
        borderRadius: "0 0 24px 24px",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
      }}
    >
      {/* Month Navigator */}
      <MonthNavigation
        calendarType={calendarType}
        language={language}
        viewingHijriMonth={viewingHijriMonth}
        viewingHijriYear={viewingHijriYear}
        viewingGregorianMonth={viewingGregorianMonth}
        viewingGregorianYear={viewingGregorianYear}
        onPrevMonth={onPrevMonth}
        onNextMonth={onNextMonth}
      />

      {/* Day Headers */}
      <DayHeader language={language} />

      {/* Calendar Grid */}
      <CalendarGrid
        calendarDays={calendarDays}
        language={language}
        onSelectDate={onSelectDate}
        isToday={isToday}
        isSelected={isSelected}
      />

      {/* Today Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onGoToToday();
        }}
        style={{
          width: "100%",
          marginTop: "1.5rem",
          padding: "0.875rem",
          background: "linear-gradient(135deg, #1a1a2e, #16213e)",
          color: "#ffd700",
          border: "none",
          borderRadius: "12px",
          fontSize: "0.875rem",
          fontWeight: "600",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
          transition: "all 0.2s",
          direction: language === "ar" ? "rtl" : "ltr",
        }}
      >
        {language === "ar" ? "اليوم" : "Today"}
      </button>
    </div>
  );
};
