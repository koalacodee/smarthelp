import React from 'react';
import { hijriToGregorian } from '../utils/hijriUtils';
import type { DayCellProps } from '../types';

/**
 * Individual day cell component
 */
export const DayCell: React.FC<DayCellProps> = ({ 
  dateObj, 
  isToday, 
  isSelected, 
  onSelect 
}) => {
  // Determine if this day is Friday
  const isFriday = (): boolean => {
    if (dateObj.type === 'hijri') {
      return hijriToGregorian(dateObj.year, dateObj.month, dateObj.day).getDay() === 5;
    } else {
      return new Date(dateObj.year, dateObj.month, dateObj.day).getDay() === 5;
    }
  };

  const fridayDate = isFriday();

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className="day-cell"
      style={{
        border: 'none',
        background: isSelected 
          ? 'linear-gradient(135deg, #ffd700, #ffb700)'
          : isToday
          ? 'rgba(255, 215, 0, 0.2)'
          : 'transparent',
        color: isSelected 
          ? '#1a1a2e'
          : !dateObj.isCurrentMonth 
          ? 'rgba(26, 26, 46, 0.3)'
          : fridayDate
          ? '#ffd700'
          : '#1a1a2e',
        padding: '0.75rem',
        borderRadius: '12px',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: isSelected || isToday ? '700' : '500',
        boxShadow: isSelected ? '0 4px 12px rgba(255, 215, 0, 0.4)' : 'none',
        position: 'relative'
      }}
    >
      {dateObj.day}
      {isToday && !isSelected && (
        <div style={{
          position: 'absolute',
          bottom: '4px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '4px',
          height: '4px',
          borderRadius: '50%',
          background: '#ffd700'
        }} />
      )}
    </button>
  );
};
