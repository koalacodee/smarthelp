'use client';

import { useEffect, useState } from 'react';
import { useLocaleStore } from '@/lib/store/useLocaleStore';
import { useV2TaskPageStore } from '../../_store/use-v2-task-page-store';
import api from '@/lib/api';
import type { TicketAssignee } from '@/lib/api';

interface TaskAssignmentFieldsProps {
  departmentId: string;
  onDepartmentChange: (id: string) => void;
  assigneeId?: string;
  onAssigneeChange?: (id: string) => void;
}

export default function TaskAssignmentFields({ departmentId, onDepartmentChange, assigneeId, onAssigneeChange }: TaskAssignmentFieldsProps) {
  const locale = useLocaleStore((state) => state.locale);
  const { role, departments, subDepartments } = useV2TaskPageStore();
  const [employees, setEmployees] = useState<TicketAssignee[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);

  useEffect(() => {
    if (role === 'supervisor' && departmentId) {
      setIsLoadingEmployees(true);
      api.EmployeeService.getEmployeesBySubDepartment(departmentId)
        .then((data) => {
          setEmployees(data);
        })
        .finally(() => {
          setIsLoadingEmployees(false);
        });
    } else {
      setEmployees([]);
    }
  }, [role, departmentId]);

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
              <select
                value={assigneeId ?? ''}
                onChange={(e) => onAssigneeChange(e.target.value)}
                disabled={!departmentId || isLoadingEmployees}
                className="w-full border border-border rounded-md p-2 bg-background disabled:opacity-50"
              >
                <option value="">{fields.assigneePlaceholder}</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.user.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </>
      )}
    </div>
  );
}
