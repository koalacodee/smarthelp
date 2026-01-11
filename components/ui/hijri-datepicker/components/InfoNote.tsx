import React from 'react';
import type { InfoNoteProps } from '../types';

/**
 * Info note component at the bottom
 */
export const InfoNote: React.FC<InfoNoteProps> = ({ calendarType, language }) => {
  return (
    <div style={{
      marginTop: '1.5rem',
      padding: '1rem',
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      textAlign: 'center',
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: '0.75rem',
      direction: language === 'ar' ? 'rtl' : 'ltr'
    }}>
      {language === 'ar' 
        ? `تقويم ${calendarType === 'hijri' ? 'هجري' : 'ميلادي'} قابل للتبديل • يوم الجمعة مميز باللون الذهبي`
        : `Switchable ${calendarType === 'hijri' ? 'Hijri' : 'Gregorian'} Calendar • Friday highlighted in gold`}
    </div>
  );
};
