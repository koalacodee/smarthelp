import React from 'react';
import { DayCell } from './DayCell';
import type { CalendarGridProps } from '../types';

/**
 * Calendar grid component
 */
export const CalendarGrid: React.FC<CalendarGridProps> = ({
  calendarDays,
  language,
  onSelectDate,
  isToday,
  isSelected
}) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '0.5rem',
      direction: language === 'ar' ? 'rtl' : 'ltr'
    }}>
      {calendarDays.map((dateObj, index) => (
        <DayCell
          key={index}
          dateObj={dateObj}
          isToday={isToday(dateObj.day, dateObj.month, dateObj.year, dateObj.type)}
          isSelected={isSelected(dateObj.day, dateObj.month, dateObj.year, dateObj.type)}
          onSelect={() => onSelectDate(dateObj.day, dateObj.month, dateObj.year, dateObj.type)}
        />
      ))}
    </div>
  );
};
