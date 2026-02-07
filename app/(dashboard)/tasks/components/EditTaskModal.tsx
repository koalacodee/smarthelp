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
import TaskRemindersInput, {
  SpecificReminderEntry,
} from "./TaskRemindersInput";
import { TaskReminder } from "@/lib/api/tasks";
import { formatDateTimeWithHijri } from "@/locales/dateFormatter";
import Clock from "@/icons/Clock";

type EditTaskModalProps = {
  role: "admin" | "supervisor";
};

export default function EditTaskModal({ role }: EditTaskModalProps) {
  const locale = useLocaleStore((state) => state.locale);
  const language = useLocaleStore((state) => state.language);
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
  const [existingReminders, setExistingReminders] = useState<TaskReminder[]>([]);
  const [deleteReminderIds, setDeleteReminderIds] = useState<string[]>([]);
  const [newReminders, setNewReminders] = useState<SpecificReminderEntry[]>([]);

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

  // Initialize reminder state only when task changes
  useEffect(() => {
    if (task) {
      setExistingReminders(task.taskReminders ?? []);
      setDeleteReminderIds([]);
      setNewReminders([]);
    } else {
      setExistingReminders([]);
      setDeleteReminderIds([]);
      setNewReminders([]);
    }
  }, [task]);

  useEffect(() => {
    if (task) {
      const init = async () => {
        setTitle(task.title || "");
        setDescription(task.description || "");
        setPriority(task.priority || "MEDIUM");
        // Convert existing ISO due date to YYYY-MM-DD for the date input
        const formattedDueDate = task.dueDate
          ? new Date(task.dueDate).toISOString().slice(0, 10)
          : "";
        setDueDate(formattedDueDate);

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
        targetSubDepartmentId,
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
    setExistingReminders([]);
    setDeleteReminderIds([]);
    setNewReminders([]);
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
      // Validate partially-filled reminders
      const incompleteReminder = newReminders.find(
        (r) =>
          (r.name || r.dateTime || r.intervalDays || r.intervalHours || r.intervalMinutes) &&
          (!r.name || !r.dateTime)
      );
      if (incompleteReminder) {
        setRootError(
          locale.tasks.modals.addTask.fields.reminderValidationIncomplete ??
            "Each reminder must have a name and date/time."
        );
        return;
      }

      // Validate minimum interval
      const invalidIntervalReminder = newReminders.find((r) => {
        if (!r.name || !r.dateTime) return false;
        const intervalMs =
          (r.intervalDays * 24 * 60 + r.intervalHours * 60 + r.intervalMinutes) * 60 * 1000;
        return intervalMs > 0 && intervalMs < 60000;
      });
      if (invalidIntervalReminder) {
        setRootError(
          locale.tasks.modals.addTask.fields.reminderValidationMinInterval ??
            "Reminder repeat interval must be at least 1 minute."
        );
        return;
      }

      const addReminders = newReminders
        .filter((r) => r.name && r.dateTime)
        .map((r) => ({
          name: r.name,
          reminderDate: new Date(r.dateTime),
          reminderInterval:
            (r.intervalDays * 24 * 60 + r.intervalHours * 60 + r.intervalMinutes) *
            60 *
            1000,
        }));

      let updateTaskDto: UpdateTaskDto = {
        title,
        description,
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        chooseAttachments: selectedAttachments,
        deleteAttachments: deletedAttachments,
        ...(addReminders.length > 0 && { addReminders }),
        ...(deleteReminderIds.length > 0 && { deleteReminders: deleteReminderIds }),
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
        hasFilesToUpload,
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
            locale.tasks.teamTasks.toasts.updateFailed,
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

            {/* Existing reminders */}
            {existingReminders.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-2">
                  {locale.tasks.modals.addTask.fields.scheduledReminders}
                </h4>
                <div className="space-y-2">
                  {existingReminders.map((reminder) => {
                    const isMarkedForDeletion = deleteReminderIds.includes(
                      reminder.id
                    );
                    return (
                      <div
                        key={reminder.id}
                        className={`flex items-center gap-3 rounded-lg border px-4 py-2.5 text-sm ${
                          isMarkedForDeletion
                            ? "border-red-300 bg-red-50 opacity-60"
                            : "border-border bg-muted/30"
                        }`}
                      >
                        <Clock className="h-4 w-4 shrink-0 text-blue-500" />
                        <span
                          className={`flex-1 font-medium ${
                            isMarkedForDeletion
                              ? "line-through text-muted-foreground"
                              : "text-foreground"
                          }`}
                        >
                          {reminder.name}
                        </span>
                        <span className="text-muted-foreground">|</span>
                        <span className="text-muted-foreground">
                          {formatDateTimeWithHijri(
                            reminder.reminderDate,
                            language,
                            {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                            },
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (isMarkedForDeletion) {
                              setDeleteReminderIds((prev) =>
                                prev.filter((id) => id !== reminder.id)
                              );
                            } else {
                              setDeleteReminderIds((prev) => [
                                ...prev,
                                reminder.id,
                              ]);
                            }
                          }}
                          className={`shrink-0 rounded p-1.5 transition-colors ${
                            isMarkedForDeletion
                              ? "text-blue-600 hover:bg-blue-50"
                              : "text-muted-foreground hover:bg-muted hover:text-red-500"
                          }`}
                          aria-label={
                            isMarkedForDeletion
                              ? "Undo remove"
                              : "Remove reminder"
                          }
                        >
                          {isMarkedForDeletion ? (
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 10h10a5 5 0 015 5v2M3 10l4-4m-4 4l4 4"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="h-4 w-4"
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
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Add new reminders */}
            <TaskRemindersInput
              specificReminders={newReminders}
              onSpecificRemindersChange={setNewReminders}
            />

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
