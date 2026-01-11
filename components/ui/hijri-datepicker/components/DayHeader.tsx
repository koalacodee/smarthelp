import React from 'react';
import { DAY_NAMES_EN, DAY_NAMES_AR } from '../utils/hijriUtils';
import type { DayHeaderProps } from '../types';

/**
 * Day names header component
 */
export const DayHeader: React.FC<DayHeaderProps> = ({ language }) => {
  const dayNames = language === 'ar' ? DAY_NAMES_AR : DAY_NAMES_EN;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '0.5rem',
      marginBottom: '0.75rem',
      direction: language === 'ar' ? 'rtl' : 'ltr'
    }}>
      {dayNames.map((day, i) => (
        <div key={i} style={{
          textAlign: 'center',
          fontSize: '0.75rem',
          fontWeight: '600',
          color: i === 5 ? '#ffd700' : '#1a1a2e',
          opacity: 0.6,
          padding: '0.5rem 0'
        }}>
          {day}
        </div>
      ))}
    </div>
  );
};
