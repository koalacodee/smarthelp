"use client";

import { useLocaleStore } from "@/lib/store/useLocaleStore";
import Clock from "@/icons/Clock";

interface DaysBeforeDeadlineInputProps {
  value: number;
  onChange: (value: number) => void;
}

export default function DaysBeforeDeadlineInput({
  value,
  onChange,
}: DaysBeforeDeadlineInputProps) {
  const locale = useLocaleStore((state) => state.locale);
  if (!locale) return null;

  const fields = locale.tasks.modals.addTask.fields;

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-center gap-2 mb-1">
        <Clock className="h-5 w-5 text-amber-600" />
        <h4 className="text-sm font-bold text-amber-800">
          {fields.automaticReminderRule}
        </h4>
      </div>
      <p className="text-xs text-gray-500 mb-3">
        {fields.automaticReminderRuleDescription}
      </p>
      <div className="flex items-center gap-3">
        <input
          type="number"
          min={0}
          value={value}
          onChange={(e) =>
            onChange(Math.max(0, parseInt(e.target.value, 10) || 0))
          }
          className="w-20 rounded-md border border-amber-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-colors"
        />
        <span className="text-sm font-semibold text-amber-800">
          {fields.daysBeforeDeadline}
        </span>
      </div>
    </div>
  );
}
