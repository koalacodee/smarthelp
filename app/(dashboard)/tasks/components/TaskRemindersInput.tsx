"use client";

import { useLocaleStore } from "@/lib/store/useLocaleStore";
import Plus from "@/icons/Plus";

export interface SpecificReminderEntry {
  id: string;
  name: string;
  dateTime: string;
  intervalDays: number;
  intervalHours: number;
  intervalMinutes: number;
}

interface TaskRemindersInputProps {
  specificReminders: SpecificReminderEntry[];
  onSpecificRemindersChange: (reminders: SpecificReminderEntry[]) => void;
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    </svg>
  );
}

function RemoveIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

export default function TaskRemindersInput({
  specificReminders,
  onSpecificRemindersChange,
}: TaskRemindersInputProps) {
  const locale = useLocaleStore((state) => state.locale);
  if (!locale) return null;

  const fields = locale.tasks.modals.addTask.fields;

  const addSpecificReminder = () => {
    onSpecificRemindersChange([
      ...specificReminders,
      {
        id: crypto.randomUUID(),
        name: "",
        dateTime: "",
        intervalDays: 0,
        intervalHours: 0,
        intervalMinutes: 0,
      },
    ]);
  };

  const updateSpecificReminder = (
    id: string,
    updates: Partial<Omit<SpecificReminderEntry, "id">>
  ) => {
    onSpecificRemindersChange(
      specificReminders.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      )
    );
  };

  const removeSpecificReminder = (id: string) => {
    onSpecificRemindersChange(specificReminders.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-4">

      {/* Additional Specific Reminders */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground">
          {fields.additionalSpecificReminders}
        </h4>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {fields.additionalSpecificRemindersHint}
        </p>
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={addSpecificReminder}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            {fields.addReminder}
          </button>
        </div>
        <div className="mt-3 space-y-4">
          {specificReminders.map((reminder) => (
            <div
              key={reminder.id}
              className="flex flex-col gap-4 rounded-lg border border-border bg-muted/30 px-4 py-4"
            >
              {/* Row 1: name, date, time, remove */}
              <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap">
                <BellIcon className="h-5 w-5 shrink-0 text-blue-500" />
                <input
                  type="text"
                  value={reminder.name}
                  onChange={(e) =>
                    updateSpecificReminder(reminder.id, { name: e.target.value })
                  }
                  placeholder={fields.reminderNamePlaceholder}
                  className="min-w-0 flex-1 rounded border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                />
                <input
                  type="date"
                  value={reminder.dateTime}
                  onChange={(e) =>
                    updateSpecificReminder(reminder.id, { dateTime: e.target.value })
                  }
                  className="rounded border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => removeSpecificReminder(reminder.id)}
                  className="shrink-0 rounded p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Remove reminder"
                >
                  <RemoveIcon className="h-4 w-4" />
                </button>
              </div>
              {/* Row 2: interval (days, hours, minutes) */}
              <div className="flex flex-wrap items-center gap-4 border-t border-border pt-3">
                <span className="text-xs font-medium text-muted-foreground">
                  {fields.reminderIntervalHint}
                </span>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 text-sm">
                    <input
                      type="number"
                      min={0}
                      value={reminder.intervalDays}
                      onChange={(e) =>
                        updateSpecificReminder(reminder.id, {
                          intervalDays: Math.max(0, parseInt(e.target.value, 10) || 0),
                        })
                      }
                      placeholder="0"
                      title={fields.days}
                      className="w-14 rounded border border-border bg-background px-2 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                    <span className="text-xs text-muted-foreground">{fields.days}</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-sm">
                    <input
                      type="number"
                      min={0}
                      max={23}
                      value={reminder.intervalHours}
                      onChange={(e) =>
                        updateSpecificReminder(reminder.id, {
                          intervalHours: Math.max(0, Math.min(23, parseInt(e.target.value, 10) || 0)),
                        })
                      }
                      placeholder="0"
                      title={fields.hours}
                      className="w-12 rounded border border-border bg-background px-2 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                    <span className="text-xs text-muted-foreground">{fields.hours}</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-sm">
                    <input
                      type="number"
                      min={0}
                      max={59}
                      value={reminder.intervalMinutes}
                      onChange={(e) =>
                        updateSpecificReminder(reminder.id, {
                          intervalMinutes: Math.max(0, Math.min(59, parseInt(e.target.value, 10) || 0)),
                        })
                      }
                      placeholder="0"
                      title={fields.minutes}
                      className="w-12 rounded border border-border bg-background px-2 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                    <span className="text-xs text-muted-foreground">{fields.minutes}</span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
