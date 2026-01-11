import React, { useState, useRef, useEffect } from "react";
import Calendar from "@/icons/Calendar";
import X from "@/icons/X";
import { useDatePicker } from "../hooks/useDatePicker";
import { useCalendarGrid } from "../hooks/useCalendarGrid";
import { DatePickerHeader } from "./DatePickerHeader";
import { CalendarBody } from "./CalendarBody";
import {
  formatHijriDate,
  formatGregorianDate,
  gregorianToHijri,
} from "../utils/hijriUtils";
import type { CalendarType, Language, HijriDate } from "../types";

/**
 * Props for DatePickerInput component
 */
export interface DatePickerInputProps {
  value?: Date;
  onChange?: (date: Date) => void;
  defaultCalendar?: CalendarType;
  defaultLanguage?: Language;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  label?: string;
}

/**
 * DatePickerInput - A component that displays selected date and opens picker in popover
 */
const DatePickerInput: React.FC<DatePickerInputProps> = ({
  value,
  onChange,
  defaultCalendar = "hijri",
  defaultLanguage = "en",
  placeholder = "Select a date...",
  disabled = false,
  className = "",
  label,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(value || null);
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Handle date selection
  const handleDateChange = (date: Date): void => {
    setSelectedDate(date);
    setIsOpen(false);
    onChange?.(date);
  };

  // Format display text
  const getDisplayText = (): string => {
    if (!selectedDate) return placeholder;

    const hijriDate: HijriDate = gregorianToHijri(selectedDate);
    const gregorianText = formatGregorianDate(selectedDate, defaultLanguage);
    const hijriText = formatHijriDate(hijriDate, defaultLanguage);

    if (defaultCalendar === "hijri") {
      return `${hijriText} (${selectedDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })})`;
    } else {
      return `${gregorianText} (${hijriText})`;
    }
  };

  // Handle click outside to close popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  // Clear date
  const handleClear = (e: React.MouseEvent): void => {
    e.stopPropagation();
    setSelectedDate(null);
    onChange?.(new Date());
  };

  // Update internal state when value prop changes
  useEffect(() => {
    if (value) {
      setSelectedDate(value);
    }
  }, [value]);

  return (
    <div
      className={`date-picker-input-wrapper ${className}`}
      ref={containerRef}
    >
      {label && (
        <label
          style={{
            display: "block",
            marginBottom: "0.5rem",
            fontSize: "0.875rem",
            fontWeight: "600",
            color: "#1a1a2e",
          }}
        >
          {label}
        </label>
      )}

      <div style={{ position: "relative" }}>
        {/* Input Field */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          style={{
            width: "100%",
            padding: "0.875rem 1rem",
            paddingRight: selectedDate ? "5rem" : "3rem",
            background: disabled ? "#f5f5f5" : "#fff",
            border: "2px solid",
            borderColor: isOpen ? "#ffd700" : "#e0e0e0",
            borderRadius: "12px",
            fontSize: "0.875rem",
            textAlign: "left",
            cursor: disabled ? "not-allowed" : "pointer",
            color: selectedDate ? "#1a1a2e" : "#999",
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            boxShadow: isOpen
              ? "0 4px 12px rgba(255, 215, 0, 0.2)"
              : "0 2px 4px rgba(0, 0, 0, 0.05)",
            fontFamily: '"Noto Kufi Arabic", "Segoe UI", system-ui, sans-serif',
          }}
        >
          <Calendar
            className="w-[18px] h-[18px] flex-shrink-0"
            style={{ color: isOpen ? "#ffd700" : "#666" }}
          />
          <span
            style={{
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {getDisplayText()}
          </span>
        </button>

        {/* Clear Button */}
        {selectedDate && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            style={{
              position: "absolute",
              right: "3rem",
              top: "50%",
              transform: "translateY(-50%)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "0.25rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#999",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#ff4444")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#999")}
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Dropdown Arrow */}
        <div
          style={{
            position: "absolute",
            right: "1rem",
            top: "50%",
            transform: `translateY(-50%) rotate(${isOpen ? "180deg" : "0deg"})`,
            transition: "transform 0.2s",
            pointerEvents: "none",
            color: "#666",
          }}
        >
          <svg width="12" height="8" viewBox="0 0 12 8" fill="currentColor">
            <path
              d="M1 1l5 5 5-5"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Popover */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0, 0, 0, 0.5)",
                zIndex: 9999,
                animation: "fadeIn 0.2s ease-out",
              }}
              onClick={() => setIsOpen(false)}
            />

            {/* Popover Content - Centered on screen */}
            <div
              ref={popoverRef}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 10000,
                background: "#fff",
                borderRadius: "16px",
                boxShadow: "0 10px 40px rgba(0, 0, 0, 0.25)",
                animation: "slideInCenter 0.2s ease-out",
                width: "90%",
                maxWidth: "450px",
                maxHeight: "90vh",
                overflow: "auto",
              }}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                style={{
                  position: "absolute",
                  top: "1rem",
                  right: "1rem",
                  background: "rgba(26, 26, 46, 0.1)",
                  border: "none",
                  borderRadius: "8px",
                  padding: "0.5rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 1001,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(26, 26, 46, 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(26, 26, 46, 0.1)";
                }}
              >
                <X className="w-4 h-4" />
              </button>

              {/* Date Picker Content */}
              <div
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                style={{ padding: "1rem" }}
              >
                <DatePickerContent
                  onDateChange={handleDateChange}
                  initialDate={selectedDate || new Date()}
                  defaultCalendar={defaultCalendar}
                  defaultLanguage={defaultLanguage}
                />
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInCenter {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

/**
 * DatePickerContent - Inline date picker for popover
 */
interface DatePickerContentProps {
  onDateChange: (date: Date) => void;
  initialDate: Date;
  defaultCalendar: CalendarType;
  defaultLanguage: Language;
}

const DatePickerContent: React.FC<DatePickerContentProps> = ({
  onDateChange,
  initialDate,
  defaultCalendar,
  defaultLanguage,
}) => {
  const datePickerState = useDatePicker({
    initialDate,
    defaultCalendar,
    defaultLanguage,
    onDateChange,
  });

  const calendarDays = useCalendarGrid({
    calendarType: datePickerState.calendarType,
    viewingHijriMonth: datePickerState.viewingHijriMonth,
    viewingHijriYear: datePickerState.viewingHijriYear,
    viewingGregorianMonth: datePickerState.viewingGregorianMonth,
    viewingGregorianYear: datePickerState.viewingGregorianYear,
  });

  return (
    <div
      style={{
        fontFamily: '"Noto Kufi Arabic", "Segoe UI", system-ui, sans-serif',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;500;600;700&family=Amiri:wght@400;700&display=swap');
        
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

      <div style={{ maxWidth: "450px" }}>
        <DatePickerHeader
          calendarType={datePickerState.calendarType}
          language={datePickerState.language}
          selectedHijri={datePickerState.selectedHijri}
          selectedGregorian={datePickerState.selectedGregorian}
          onLanguageToggle={datePickerState.toggleLanguage}
          onCalendarTypeSwitch={datePickerState.switchCalendarType}
        />

        <CalendarBody
          calendarType={datePickerState.calendarType}
          language={datePickerState.language}
          viewingHijriMonth={datePickerState.viewingHijriMonth}
          viewingHijriYear={datePickerState.viewingHijriYear}
          viewingGregorianMonth={datePickerState.viewingGregorianMonth}
          viewingGregorianYear={datePickerState.viewingGregorianYear}
          calendarDays={calendarDays}
          onPrevMonth={datePickerState.prevMonth}
          onNextMonth={datePickerState.nextMonth}
          onSelectDate={datePickerState.selectDate}
          onGoToToday={datePickerState.goToToday}
          isToday={datePickerState.isToday}
          isSelected={datePickerState.isSelected}
        />
      </div>
    </div>
  );
};

export default DatePickerInput;
