"use client";

import React, { useState, useEffect, useMemo } from "react";
import api, { UpdateTaskDto } from "@/lib/api";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import { useCurrentEditingTaskStore } from "../store/useCurrentEditingTaskStore";
import { Department } from "@/lib/api/departments";
import { TicketAssignee } from "@/lib/api";
import { useTaskStore } from "@/lib/store";
import useFormErrors from "@/hooks/useFormErrors";
import AttachmentInputV3 from "@/app/(dashboard)/files/components/v3/AttachmentInput";
import { useAttachments } from "@/hooks/useAttachments";
import { useLocaleStore } from "@/lib/store/useLocaleStore";

type EditTaskModalProps = {
  role: "admin" | "supervisor";
};

// Helper function to calculate reminder in milliseconds
const calculateReminderMilliseconds = (
  days?: number,
  hours?: number,
  minutes?: number
): number | undefined => {
  if (!days && !hours && !minutes) return undefined;

  const totalDays = days || 0;
  const totalHours = hours || 0;
  const totalMinutes = minutes || 0;

  // Convert everything to milliseconds
  const daysInMs = totalDays * 24 * 60 * 60 * 1000;
  const hoursInMs = totalHours * 60 * 60 * 1000;
  const minutesInMs = totalMinutes * 60 * 1000;

  return daysInMs + hoursInMs + minutesInMs;
};

// Helper function to convert milliseconds back to days, hours, minutes
const convertMillisecondsToTime = (milliseconds?: number) => {
  if (!milliseconds) return { days: 0, hours: 0, minutes: 0 };

  const totalMinutes = Math.floor(milliseconds / (1000 * 60));
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;

  return { days, hours, minutes };
};

export default function EditTaskModal({ role }: EditTaskModalProps) {
  const locale = useLocaleStore((state) => state.locale);
  const { clearErrors, setErrors, setRootError, errors } = useFormErrors([
    "title",
    "description",
    "departmentId",
    "targetSubDepartmentId",
  ]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [targetSubDepartmentId, setTargetSubDepartmentId] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [reminderDays, setReminderDays] = useState<number>(0);
  const [reminderHours, setReminderHours] = useState<number>(0);
  const [reminderMinutes, setReminderMinutes] = useState<number>(0);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subDepartments, setSubDepartments] = useState<Department[]>([]);
  const [subDepartmentEmployees, setSubDepartmentEmployees] = useState<
    TicketAssignee[]
  >([]);
  const [uploadKeyV3, setUploadKeyV3] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isWaitingToClose, setIsWaitingToClose] = useState(false);
  const [hasStartedUpload, setHasStartedUpload] = useState(false);
  const [selectedAttachments, setSelectedAttachments] = useState<string[]>([]);
  const [deletedAttachments, setDeletedAttachments] = useState<string[]>([]);
  const [hasFilesToUpload, setHasFilesToUpload] = useState(false);

  const { addToast } = useToastStore();
  const { task, setIsEditing, isEditing } = useCurrentEditingTaskStore();
  const { updateTask } = useTaskStore();

  if (!locale) return null;
  const {
    moveCurrentNewTargetSelectionsToExisting,
    moveSelectedFormMyAttachmentsToExisting,
    reset,
    confirmExistingAttachmentsDeletionForTarget,
  } = useAttachments();

  useEffect(() => {
    Promise.all([
      api.DepartmentsService.getAllDepartments().then(setDepartments),
      api.DepartmentsService.getAllSubDepartments().then(setSubDepartments),
    ]);
  }, []);

  const subDepartmentsForCategory = useMemo(() => {
    if (!departmentId) return [];
    return subDepartments.filter((sd) => sd.parent?.id === departmentId);
  }, [departmentId, subDepartments]);

  useEffect(() => {
    if (task) {
      const init = async () => {
        setTitle(task.title || "");
        setDescription(task.description || "");
        setPriority(task.priority || "MEDIUM");
        setDueDate(task.dueDate || "");

        // Load existing reminder interval values
        const reminderTime = convertMillisecondsToTime(task.reminderInterval);
        setReminderDays(reminderTime.days);
        setReminderHours(reminderTime.hours);
        setReminderMinutes(reminderTime.minutes);

        if (role === "admin") {
          setDepartmentId(task.targetDepartment?.id || "");
        } else {
          setTargetSubDepartmentId(task.targetSubDepartment?.id || "");
          setAssigneeId(task.assignee?.id || "");
        }
      };
      init();
    } else {
      // Reset for new task
      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setDueDate("");
      setReminderDays(0);
      setReminderHours(0);
      setReminderMinutes(0);
      setDepartmentId("");
      setTargetSubDepartmentId("");
      setAssigneeId("");
    }
  }, [task, departments, role]);

  useEffect(() => {
    // When department changes, reset sub-department if it's no longer valid (only for admin role)
    if (
      role === "admin" &&
      !subDepartmentsForCategory.some((sd) => sd.id === targetSubDepartmentId)
    ) {
      setTargetSubDepartmentId("");
    }
  }, [departmentId, subDepartmentsForCategory, targetSubDepartmentId, role]);

  useEffect(() => {
    if (targetSubDepartmentId) {
      api.EmployeeService.getEmployeesBySubDepartment(
        targetSubDepartmentId
      ).then((val) => {
        setSubDepartmentEmployees(val);
      });
    }
  }, [targetSubDepartmentId]);

  const handleClose = () => {
    setIsEditing(false);
    setIsWaitingToClose(false);
    setIsUploading(false);
    setHasStartedUpload(false);
    setUploadKeyV3(null);
    setSelectedAttachments([]);
    setDeletedAttachments([]);
    setHasFilesToUpload(false);
    reset();
  };

  useEffect(() => {
    if (hasStartedUpload && !isUploading && isWaitingToClose) {
      handleClose();
    }
  }, [hasStartedUpload, isUploading, isWaitingToClose]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    if (!title || !description) {
      setRootError(locale.supervisors.toasts.fillAllFields);
      return;
    }

    if (role === "admin" && !departmentId) {
      setRootError(locale.tasks.modals.addTask.fields.departmentPlaceholder);
      return;
    }

    if (role === "supervisor" && !targetSubDepartmentId) {
      setRootError(locale.tasks.modals.addTask.fields.subDepartmentPlaceholder);
      return;
    }

    if (!task?.id) return;

    try {
      // Calculate reminder in milliseconds
      const reminderMs = calculateReminderMilliseconds(
        reminderDays,
        reminderHours,
        reminderMinutes
      );

      let updateTaskDto: UpdateTaskDto = {
        title,
        description,
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        reminderInterval: reminderMs,
        chooseAttachments: selectedAttachments,
        deleteAttachments: deletedAttachments,
      };

      if (role === "admin") {
        updateTaskDto.targetDepartmentId = departmentId;
      } else {
        updateTaskDto.targetSubDepartmentId = targetSubDepartmentId;
        updateTaskDto.assigneeId = assigneeId || undefined;
      }

      const updatedResp = await api.TasksService.updateTask(
        task.id,
        updateTaskDto,
        hasFilesToUpload
      );

      const { task: updated, fileHubUploadKey } = updatedResp;

      if (updated.id && selectedAttachments.length > 0) {
        moveSelectedFormMyAttachmentsToExisting(updated.id);
      }
      if (updated.id && deletedAttachments.length > 0) {
        confirmExistingAttachmentsDeletionForTarget(updated.id);
      }

      updateTask(task.id, updated as any);

      addToast({
        message: locale.tasks.teamTasks.toasts.updateSuccess,
        type: "success",
      });

      if (hasFilesToUpload) {
        if (fileHubUploadKey) {
          try {
            setUploadKeyV3(fileHubUploadKey);
          } catch (uploadErr: any) {
            addToast({
              message:
                (uploadErr as any)?.message ||
                locale.tasks.teamTasks.toasts.uploadFailed,
              type: "error",
            });
          }
        } else {
          addToast({
            message: locale.tasks.teamTasks.toasts.missingUploadKey,
            type: "error",
          });
        }
        setIsWaitingToClose(true);
      } else {
        handleClose();
      }
    } catch (error: any) {
      if (error?.response?.data?.data?.details) {
        setErrors(error?.response?.data?.data?.details);
      } else {
        setRootError(
          error?.response?.data?.message ||
            locale.tasks.teamTasks.toasts.updateFailed
        );
      }
    }
  };

  const modalTitle = task
    ? locale.tasks.modals.editTask.title
    : locale.tasks.modals.addTask.title;
  const selectedDepartmentName =
    departments.find((d) => d.id === departmentId)?.name ||
    locale.tasks.modals.addTask.fields.department;

  if (!isEditing) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50  flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={handleClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white rounded-lg shadow-xl p-6 md:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSave}>
          <h3 className="text-xl font-bold mb-6 text-slate-800">
            {modalTitle}
          </h3>

          {errors.root && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <span>{errors.root}</span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="task-title"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                {locale.tasks.modals.addTask.fields.title}
              </label>
              <input
                id="task-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder={
                  locale.tasks.modals.addTask.fields.titlePlaceholder
                }
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-700">{errors.title}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="task-description"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                {locale.tasks.modals.addTask.fields.description}
              </label>
              <textarea
                id="task-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder={
                  locale.tasks.modals.addTask.fields.descriptionPlaceholder
                }
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-700">
                  {errors.description}
                </p>
              )}
            </div>

            {role === "admin" ? (
              <div>
                <label
                  htmlFor="task-department"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  {locale.tasks.modals.addTask.fields.department}
                </label>
                <select
                  id="task-department"
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                  required
                >
                  <option value="">
                    {locale.tasks.modals.addTask.fields.departmentPlaceholder}
                  </option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                {errors.departmentId && (
                  <p className="mt-1 text-sm text-red-700">
                    {errors.departmentId}
                  </p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="task-subdepartment"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    {locale.tasks.modals.addTask.fields.subDepartment}
                  </label>
                  <select
                    id="task-subdepartment"
                    value={targetSubDepartmentId}
                    onChange={(e) => {
                      setAssigneeId("");
                      setTargetSubDepartmentId(e.target.value);
                    }}
                    className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                    required
                  >
                    <option value="">
                      {
                        locale.tasks.modals.addTask.fields
                          .subDepartmentPlaceholder
                      }
                    </option>
                    {subDepartments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                  {errors.targetSubDepartmentId && (
                    <p className="mt-1 text-sm text-red-700">
                      {errors.targetSubDepartmentId}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="task-assignee"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    {locale.tasks.modals.addTask.fields.assignee}
                  </label>
                  <select
                    id="task-assignee"
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-slate-50 disabled:opacity-50"
                    disabled={!targetSubDepartmentId}
                  >
                    <option value="">
                      {locale.tasks.modals.addTask.fields.assigneePlaceholder}
                    </option>
                    {subDepartmentEmployees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.user.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="task-priority"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  {locale.tasks.modals.addTask.fields.priority}
                </label>
                <select
                  id="task-priority"
                  value={priority}
                  onChange={(e) =>
                    setPriority(e.target.value as "LOW" | "MEDIUM" | "HIGH")
                  }
                  className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="LOW">
                    {locale.tasks.modals.addTask.priorityOptions.low}
                  </option>
                  <option value="MEDIUM">
                    {locale.tasks.modals.addTask.priorityOptions.medium}
                  </option>
                  <option value="HIGH">
                    {locale.tasks.modals.addTask.priorityOptions.high}
                  </option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="task-due-date"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  {locale.tasks.modals.addTask.fields.dueDate}
                </label>
                <input
                  id="task-due-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {locale.tasks.modals.addTask.fields.reminder}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label
                    htmlFor="reminder-days"
                    className="block text-xs text-slate-500 mb-1"
                  >
                    {locale.tasks.modals.addTask.fields.days}
                  </label>
                  <input
                    id="reminder-days"
                    type="number"
                    min="0"
                    value={reminderDays}
                    onChange={(e) =>
                      setReminderDays(Number(e.target.value) || 0)
                    }
                    className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label
                    htmlFor="reminder-hours"
                    className="block text-xs text-slate-500 mb-1"
                  >
                    {locale.tasks.modals.addTask.fields.hours}
                  </label>
                  <input
                    id="reminder-hours"
                    type="number"
                    min="0"
                    max="23"
                    value={reminderHours}
                    onChange={(e) =>
                      setReminderHours(Number(e.target.value) || 0)
                    }
                    className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label
                    htmlFor="reminder-minutes"
                    className="block text-xs text-slate-500 mb-1"
                  >
                    {locale.tasks.modals.addTask.fields.minutes}
                  </label>
                  <input
                    id="reminder-minutes"
                    type="number"
                    min="0"
                    max="59"
                    value={reminderMinutes}
                    onChange={(e) =>
                      setReminderMinutes(Number(e.target.value) || 0)
                    }
                    className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Set a recurring reminder interval
              </p>
            </div>

            <AttachmentInputV3
              targetId={task?.id}
              uploadKey={uploadKeyV3 ?? undefined}
              uploadWhenKeyProvided={true}
              onSelectedAttachmentsChange={(set) =>
                setSelectedAttachments(Array.from(set))
              }
              onDeletedAttachmentsChange={(set) =>
                setDeletedAttachments(Array.from(set))
              }
              onUploadStart={() => {
                setHasStartedUpload(true);
                setIsUploading(true);
              }}
              onUploadEnd={() => setIsUploading(false)}
              onHasFilesToUpload={(hasFiles) => setHasFilesToUpload(hasFiles)}
            />
          </div>
          <div className="mt-8 flex justify-end gap-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-slate-200 rounded-md text-sm font-medium hover:bg-slate-300 transition-colors"
            >
              {locale.tasks.modals.editTask.buttons.cancel}
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isUploading
                ? locale.tasks.modals.editTask.buttons.saving
                : locale.tasks.modals.editTask.buttons.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
