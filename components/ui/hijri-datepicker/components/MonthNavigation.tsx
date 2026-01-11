import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  HIJRI_MONTHS,
  HIJRI_MONTHS_AR,
  GREGORIAN_MONTHS,
  GREGORIAN_MONTHS_AR,
} from "../utils/hijriUtils";
import type { MonthNavigationProps } from "../types";

/**
 * Month navigation component
 */
export const MonthNavigation: React.FC<MonthNavigationProps> = ({
  calendarType,
  language,
  viewingHijriMonth,
  viewingHijriYear,
  viewingGregorianMonth,
  viewingGregorianYear,
  onPrevMonth,
  onNextMonth,
}) => {
  const getMonthName = (): string => {
    if (calendarType === "hijri") {
      const months = language === "ar" ? HIJRI_MONTHS_AR : HIJRI_MONTHS;
      return months[viewingHijriMonth - 1];
    } else {
      const months = language === "ar" ? GREGORIAN_MONTHS_AR : GREGORIAN_MONTHS;
      return months[viewingGregorianMonth];
    }
  };

  const getYear = (): number => {
    return calendarType === "hijri" ? viewingHijriYear : viewingGregorianYear;
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "1.5rem",
        direction: language === "ar" ? "rtl" : "ltr",
      }}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          language === "ar" ? onNextMonth() : onPrevMonth();
        }}
        style={{
          background: "linear-gradient(135deg, #ffd700, #ffb700)",
          border: "none",
          width: "40px",
          height: "40px",
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "#1a1a2e",
          boxShadow: "0 4px 12px rgba(255, 215, 0, 0.3)",
          transition: "all 0.2s",
        }}
      >
        {language === "ar" ? (
          <ChevronRight size={20} />
        ) : (
          <ChevronLeft size={20} />
        )}
      </button>

      <div
        style={{
          fontFamily:
            language === "ar"
              ? '"Amiri", serif'
              : '"Noto Kufi Arabic", sans-serif',
          fontSize: "1.25rem",
          fontWeight: "700",
          color: "#1a1a2e",
        }}
      >
        {getMonthName()} {getYear()}
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          language === "ar" ? onPrevMonth() : onNextMonth();
        }}
        style={{
          background: "linear-gradient(135deg, #ffd700, #ffb700)",
          border: "none",
          width: "40px",
          height: "40px",
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "#1a1a2e",
          boxShadow: "0 4px 12px rgba(255, 215, 0, 0.3)",
          transition: "all 0.2s",
        }}
      >
        {language === "ar" ? (
          <ChevronLeft size={20} />
        ) : (
          <ChevronRight size={20} />
        )}
      </button>
    </div>
  );
};
