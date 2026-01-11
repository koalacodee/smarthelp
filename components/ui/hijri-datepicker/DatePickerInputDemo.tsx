import React, { useState } from 'react';
import DatePickerInput from './components/DatePickerInput';
import type { CalendarType, Language } from './types';

/**
 * Example usage of DatePickerInput component
 */
const DatePickerInputDemo: React.FC = () => {
  const [selectedDate1, setSelectedDate1] = useState<Date>(new Date());
  const [selectedDate2, setSelectedDate2] = useState<Date | undefined>(undefined);
  const [selectedDate3, setSelectedDate3] = useState<Date>(new Date());

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '3rem 2rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h1 style={{
          textAlign: 'center',
          color: '#1a1a2e',
          marginBottom: '1rem',
          fontSize: '2.5rem',
          fontWeight: '700'
        }}>
          Date Picker Input Demo
        </h1>
        
        <p style={{
          textAlign: 'center',
          color: '#666',
          marginBottom: '3rem',
          fontSize: '1.1rem'
        }}>
          Click on any input to open the date picker popover
        </p>

        {/* Examples Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '2rem',
          marginBottom: '3rem'
        }}>
          {/* Example 1: Hijri Default */}
          <div style={{
            background: '#fff',
            padding: '2rem',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
          }}>
            <h3 style={{ color: '#1a1a2e', marginTop: 0 }}>Hijri Calendar (Default)</h3>
            <DatePickerInput
              label="Birth Date"
              value={selectedDate1}
              onChange={setSelectedDate1}
              defaultCalendar="hijri"
              defaultLanguage="en"
              placeholder="Select your birth date..."
            />
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              background: '#f5f5f5',
              borderRadius: '8px',
              fontSize: '0.875rem'
            }}>
              <strong>Selected:</strong>
              <br />
              {selectedDate1 ? selectedDate1.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 'No date selected'}
            </div>
          </div>

          {/* Example 2: Gregorian Default */}
          <div style={{
            background: '#fff',
            padding: '2rem',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
          }}>
            <h3 style={{ color: '#1a1a2e', marginTop: 0 }}>Gregorian Calendar</h3>
            <DatePickerInput
              label="Appointment Date"
              value={selectedDate2}
              onChange={setSelectedDate2}
              defaultCalendar="gregorian"
              defaultLanguage="en"
              placeholder="Choose appointment date..."
            />
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              background: '#f5f5f5',
              borderRadius: '8px',
              fontSize: '0.875rem'
            }}>
              <strong>Selected:</strong>
              <br />
              {selectedDate2 ? selectedDate2.toISOString() : 'No date selected'}
            </div>
          </div>

          {/* Example 3: Arabic Language */}
          <div style={{
            background: '#fff',
            padding: '2rem',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
          }}>
            <h3 style={{ color: '#1a1a2e', marginTop: 0 }}>Arabic Interface</h3>
            <DatePickerInput
              label="تاريخ الحدث"
              value={selectedDate3}
              onChange={setSelectedDate3}
              defaultCalendar="hijri"
              defaultLanguage="ar"
              placeholder="اختر التاريخ..."
            />
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              background: '#f5f5f5',
              borderRadius: '8px',
              fontSize: '0.875rem',
              direction: 'rtl'
            }}>
              <strong>التاريخ المختار:</strong>
              <br />
              {selectedDate3 ? selectedDate3.toLocaleDateString('ar-SA', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 'لم يتم اختيار تاريخ'}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div style={{
          background: '#fff',
          padding: '2rem',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}>
          <h2 style={{ color: '#1a1a2e', marginTop: 0 }}>Features:</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem'
          }}>
            <div>
              <h4 style={{ color: '#ffd700', marginBottom: '0.5rem' }}>🎯 Smart Display</h4>
              <p style={{ color: '#666', fontSize: '0.875rem', margin: 0 }}>
                Shows both Hijri and Gregorian dates in a readable format
              </p>
            </div>
            <div>
              <h4 style={{ color: '#ffd700', marginBottom: '0.5rem' }}>🌍 Bilingual</h4>
              <p style={{ color: '#666', fontSize: '0.875rem', margin: 0 }}>
                Full support for English and Arabic with RTL layout
              </p>
            </div>
            <div>
              <h4 style={{ color: '#ffd700', marginBottom: '0.5rem' }}>🎨 Popover UI</h4>
              <p style={{ color: '#666', fontSize: '0.875rem', margin: 0 }}>
                Clean popover that opens on click with backdrop
              </p>
            </div>
            <div>
              <h4 style={{ color: '#ffd700', marginBottom: '0.5rem' }}>⌨️ Keyboard Support</h4>
              <p style={{ color: '#666', fontSize: '0.875rem', margin: 0 }}>
                Close with Escape key, full keyboard navigation
              </p>
            </div>
            <div>
              <h4 style={{ color: '#ffd700', marginBottom: '0.5rem' }}>🗑️ Clear Button</h4>
              <p style={{ color: '#666', fontSize: '0.875rem', margin: 0 }}>
                Easily clear the selected date with one click
              </p>
            </div>
            <div>
              <h4 style={{ color: '#ffd700', marginBottom: '0.5rem' }}>♿ Accessible</h4>
              <p style={{ color: '#666', fontSize: '0.875rem', margin: 0 }}>
                Proper focus management and ARIA labels
              </p>
            </div>
          </div>
        </div>

        {/* Usage Example */}
        <div style={{
          marginTop: '2rem',
          background: '#1a1a2e',
          padding: '2rem',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}>
          <h2 style={{ color: '#ffd700', marginTop: 0 }}>Usage Example:</h2>
          <pre style={{
            background: '#0d0d1a',
            padding: '1.5rem',
            borderRadius: '8px',
            overflow: 'auto',
            color: '#fff',
            fontSize: '0.875rem',
            lineHeight: '1.6'
          }}>
{`import DatePickerInput from './components/DatePickerInput';

function MyForm() {
  const [date, setDate] = useState<Date>(new Date());

  return (
    <DatePickerInput
      label="Select Date"
      value={date}
      onChange={setDate}
      defaultCalendar="hijri"
      defaultLanguage="en"
      placeholder="Choose a date..."
    />
  );
}`}
          </pre>
        </div>

        {/* Props Documentation */}
        <div style={{
          marginTop: '2rem',
          background: '#fff',
          padding: '2rem',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}>
          <h2 style={{ color: '#1a1a2e', marginTop: 0 }}>Component Props:</h2>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.875rem'
          }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e0e0e0' }}>Prop</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e0e0e0' }}>Type</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e0e0e0' }}>Default</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e0e0e0' }}>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #f0f0f0' }}><code>value</code></td>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #f0f0f0' }}>Date?</td>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #f0f0f0' }}>undefined</td>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #f0f0f0' }}>Controlled value</td>
              </tr>
              <tr>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #f0f0f0' }}><code>onChange</code></td>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #f0f0f0' }}>(date: Date) =&gt; void</td>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #f0f0f0' }}>undefined</td>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #f0f0f0' }}>Callback when date changes</td>
              </tr>
              <tr>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #f0f0f0' }}><code>defaultCalendar</code></td>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #f0f0f0' }}>'hijri' | 'gregorian'</td>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #f0f0f0' }}>'hijri'</td>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #f0f0f0' }}>Initial calendar type</td>
              </tr>
              <tr>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #f0f0f0' }}><code>defaultLanguage</code></td>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #f0f0f0' }}>'en' | 'ar'</td>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #f0f0f0' }}>'en'</td>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #f0f0f0' }}>Initial language</td>
              </tr>
              <tr>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #f0f0f0' }}><code>placeholder</code></td>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #f0f0f0' }}>string</td>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #f0f0f0' }}>'Select a date...'</td>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #f0f0f0' }}>Placeholder text</td>
              </tr>
              <tr>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #f0f0f0' }}><code>disabled</code></td>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #f0f0f0' }}>boolean</td>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #f0f0f0' }}>false</td>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #f0f0f0' }}>Disable the input</td>
              </tr>
              <tr>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #f0f0f0' }}><code>label</code></td>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #f0f0f0' }}>string</td>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #f0f0f0' }}>undefined</td>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #f0f0f0' }}>Label text above input</td>
              </tr>
              <tr>
                <td style={{ padding: '0.75rem' }}><code>className</code></td>
                <td style={{ padding: '0.75rem' }}>string</td>
                <td style={{ padding: '0.75rem' }}>''</td>
                <td style={{ padding: '0.75rem' }}>Additional CSS class</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DatePickerInputDemo;
