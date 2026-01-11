import React from "react";
import Calendar from "@/icons/Calendar";
import {
  HIJRI_MONTHS,
  HIJRI_MONTHS_AR,
  formatHijriDate,
  formatGregorianDate,
  gregorianToHijri,
} from "../utils/hijriUtils";
import type { DatePickerHeaderProps } from "../types";

/**
 * Header component for the date picker
 */
export const DatePickerHeader: React.FC<DatePickerHeaderProps> = ({
  calendarType,
  language,
  selectedHijri,
  selectedGregorian,
  onLanguageToggle,
  onCalendarTypeSwitch,
}) => {
  const displayedGregorian =
    calendarType === "hijri" ? selectedGregorian : selectedGregorian;
  const displayedHijri =
    calendarType === "gregorian"
      ? gregorianToHijri(selectedGregorian)
      : selectedHijri;

  return (
    <div
      style={{
        background:
          "linear-gradient(135deg, rgba(255, 215, 0, 0.95), rgba(255, 180, 0, 0.95))",
        padding: "2rem",
        borderRadius: "24px 24px 0 0",
        textAlign: "center",
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
          gap: "0.5rem",
        }}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onLanguageToggle();
          }}
          style={{
            background: "rgba(255, 255, 255, 0.3)",
            border: "none",
            padding: "0.5rem 1rem",
            borderRadius: "12px",
            color: "#1a1a2e",
            fontSize: "0.875rem",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          {language === "en" ? "عربي" : "English"}
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onCalendarTypeSwitch();
          }}
          style={{
            background: "rgba(255, 255, 255, 0.3)",
            border: "none",
            padding: "0.5rem 1rem",
            borderRadius: "12px",
            color: "#1a1a2e",
            fontSize: "0.875rem",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <Calendar className="w-4 h-4" />
          {calendarType === "hijri"
            ? language === "ar"
              ? "ميلادي"
              : "Gregorian"
            : language === "ar"
            ? "هجري"
            : "Hijri"}
        </button>
      </div>

      <h2
        style={{
          fontFamily:
            language === "ar"
              ? '"Amiri", serif'
              : '"Noto Kufi Arabic", sans-serif',
          fontSize: "1.5rem",
          fontWeight: "700",
          color: "#1a1a2e",
          margin: "0.5rem 0",
          direction: language === "ar" ? "rtl" : "ltr",
        }}
      >
        {calendarType === "hijri"
          ? language === "ar"
            ? "التقويم الهجري"
            : "Hijri Calendar"
          : language === "ar"
          ? "التقويم الميلادي"
          : "Gregorian Calendar"}
      </h2>

      <div
        style={{
          fontSize: "1rem",
          color: "#1a1a2e",
          opacity: 0.9,
          marginTop: "0.5rem",
          direction: language === "ar" ? "rtl" : "ltr",
          fontWeight: "600",
        }}
      >
        {calendarType === "hijri"
          ? formatHijriDate(displayedHijri, language)
          : formatGregorianDate(displayedGregorian, language)}
      </div>

      <div
        style={{
          fontSize: "0.875rem",
          color: "#1a1a2e",
          opacity: 0.6,
          marginTop: "0.25rem",
        }}
      >
        {calendarType === "hijri"
          ? formatGregorianDate(displayedGregorian, "en")
          : `${displayedHijri.day} ${HIJRI_MONTHS[displayedHijri.month - 1]} ${
              displayedHijri.year
            }`}
      </div>
    </div>
  );
};
