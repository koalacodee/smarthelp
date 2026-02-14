'use client';

import { useLocaleStore } from '@/lib/store/useLocaleStore';
import type { UseFormRegister, FieldErrors } from 'react-hook-form';

interface TaskFormFieldsProps {
  register: UseFormRegister<any>;
  errors: FieldErrors;
}

export default function TaskFormFields({ register, errors }: TaskFormFieldsProps) {
  const locale = useLocaleStore((state) => state.locale);
  if (!locale) return null;

  const fields = locale.tasks.modals.addTask.fields;

  return (
    <>
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-1">{fields.title}</label>
        <input {...register('title')} className="w-full border border-border rounded-md p-2 bg-background" placeholder={fields.titlePlaceholder} />
        {errors.title && <p className="mt-1 text-sm text-red-700">{errors.title.message as string}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-1">{fields.description}</label>
        <textarea {...register('description')} rows={3} className="w-full border border-border rounded-md p-2 bg-background" placeholder={fields.descriptionPlaceholder} />
        {errors.description && <p className="mt-1 text-sm text-red-700">{errors.description.message as string}</p>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">{fields.priority}</label>
          <select {...register('priority')} className="w-full border border-border rounded-md p-2 bg-background">
            <option value="MEDIUM">{locale.tasks.modals.addTask.priorityOptions.medium}</option>
            <option value="HIGH">{locale.tasks.modals.addTask.priorityOptions.high}</option>
            <option value="LOW">{locale.tasks.modals.addTask.priorityOptions.low}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">{fields.dueDate}</label>
          <input type="datetime-local" {...register('dueDate')} className="w-full border border-border rounded-md p-2 bg-background" />
        </div>
      </div>
    </>
  );
}
