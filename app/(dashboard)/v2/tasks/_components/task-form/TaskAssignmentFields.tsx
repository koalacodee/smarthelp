'use client';

import { useLocaleStore } from '@/lib/store/useLocaleStore';
import { useV2TaskPageStore } from '../../_store/use-v2-task-page-store';

interface TaskAssignmentFieldsProps {
  departmentId: string;
  onDepartmentChange: (id: string) => void;
  assigneeId?: string;
  onAssigneeChange?: (id: string) => void;
}

export default function TaskAssignmentFields({ departmentId, onDepartmentChange, assigneeId, onAssigneeChange }: TaskAssignmentFieldsProps) {
  const locale = useLocaleStore((state) => state.locale);
  const { role, departments, subDepartments } = useV2TaskPageStore();

  if (!locale) return null;

  const fields = locale.tasks.modals.addTask.fields;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {role === 'admin' ? (
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">{fields.department}</label>
          <select value={departmentId} onChange={(e) => onDepartmentChange(e.target.value)} className="w-full border border-border rounded-md p-2 bg-background">
            <option value="">{fields.selectDepartment}</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      ) : (
        <>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">{fields.subDepartment}</label>
            <select value={departmentId} onChange={(e) => onDepartmentChange(e.target.value)} className="w-full border border-border rounded-md p-2 bg-background">
              <option value="">{fields.selectSubDepartment}</option>
              {subDepartments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          {onAssigneeChange && (
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">{fields.assignee}</label>
              <input type="text" value={assigneeId ?? ''} onChange={(e) => onAssigneeChange(e.target.value)} placeholder={fields.assigneePlaceholder} className="w-full border border-border rounded-md p-2 bg-background" />
            </div>
          )}
        </>
      )}
    </div>
  );
}
