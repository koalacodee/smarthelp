"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { DialogTitle } from "@headlessui/react";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import { useV2TaskPageStore } from "../../_store/use-v2-task-page-store";
import { useUpdateTask } from "@/services/tasks";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import { useAttachments } from "@/hooks/useAttachments";
import { useTaskStore } from "@/services/tasks/store";
import ModalShell from "./ModalShell";
import TaskFormFields from "../task-form/TaskFormFields";
import TaskAssignmentFields from "../task-form/TaskAssignmentFields";
import TaskRemindersInput, {
  type SpecificReminderEntry,
} from "../task-form/TaskRemindersInput";
import AttachmentInputV3 from "@/app/(dashboard)/files/components/v3/AttachmentInput";
import ExistingAttachmentsViewer from "@/app/(dashboard)/files/components/ExistingAttachmentsViewer";
import type { TaskResponse, UpdateTaskRequest } from "@/services/tasks/types";

function buildReminders(entries: SpecificReminderEntry[]) {
  return entries
    .filter((r) => r.name.trim() && r.dateTime)
    .map((r) => ({
      name: r.name.trim(),
      reminderDate: new Date(r.dateTime),
      reminderInterval:
        (r.intervalDays || 0) * 86400000 +
        (r.intervalHours || 0) * 3600000 +
        (r.intervalMinutes || 0) * 60000,
    }));
}

export default function EditTaskModal() {
  const locale = useLocaleStore((state) => state.locale);
  const { activeModal, modalPayload, closeModal, role } = useV2TaskPageStore();
  const { addToast } = useToastStore();
  const updateMutation = useUpdateTask();
  const { fileHubUploadKey } = useTaskStore();
  const { selectedFormMyAttachments, attachmentsToUpload } = useAttachments();
  const [departmentId, setDepartmentId] = useState("");
  const [reminders, setReminders] = useState<SpecificReminderEntry[]>([]);
  const [error, setError] = useState("");

  const task = modalPayload as TaskResponse | null;
  const isOpen = activeModal === "edit-task" && !!task;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      priority: "MEDIUM",
      dueDate: "",
    },
  });

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description,
        priority: task.priority || "MEDIUM",
        dueDate: task.dueDate
          ? new Date(task.dueDate).toISOString().slice(0, 16)
          : "",
      });
      setDepartmentId(
        task.targetDepartmentId ?? task.targetSubDepartmentId ?? "",
      );
      setReminders(
        (task.reminders ?? []).map((r) => ({
          id: r.id,
          name: r.name,
          dateTime: new Date(r.reminderDate).toISOString().slice(0, 10),
          intervalDays: Math.floor(r.reminderInterval / 86400000),
          intervalHours: Math.floor((r.reminderInterval % 86400000) / 3600000),
          intervalMinutes: Math.floor((r.reminderInterval % 3600000) / 60000),
        })),
      );
    }
  }, [task, reset]);

  const handleClose = () => {
    reset();
    setError("");
    closeModal();
  };

  const onSubmit = async (data: any) => {
    if (!task) return;
    setError("");
    try {
      const req: UpdateTaskRequest = {
        title: data.title,
        description: data.description,
        priority: data.priority,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        targetDepartmentId: role === "admin" ? departmentId : undefined,
        targetSubDepartmentId: role === "supervisor" ? departmentId : undefined,
        attach: attachmentsToUpload.length > 0,
        addReminders: buildReminders(
          reminders.filter(
            (r) => !task.reminders?.some((er) => er.id === r.id),
          ),
        ),
        chooseAttachments:
          selectedFormMyAttachments.length > 0
            ? selectedFormMyAttachments.map((a) => a.id)
            : undefined,
      };
      await updateMutation.mutateAsync({ id: task.id, data: req });
      addToast({
        message: locale?.tasks.toasts?.taskUpdated ?? "Task updated",
        type: "success",
      });
      handleClose();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to update task");
    }
  };

  if (!locale) return null;

  return (
    <ModalShell isOpen={isOpen} onClose={handleClose} size="lg">
      <DialogTitle
        as="h3"
        className="text-lg font-medium leading-6 text-gray-900"
      >
        {locale.tasks.modals.editTask?.title ?? "Edit Task"}
      </DialogTitle>
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          <span>{error}</span>
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
        <TaskFormFields register={register} errors={errors} />
        <TaskAssignmentFields
          departmentId={departmentId}
          onDepartmentChange={setDepartmentId}
        />
        <TaskRemindersInput
          specificReminders={reminders}
          onSpecificRemindersChange={setReminders}
        />
        {task && <ExistingAttachmentsViewer targetId={task.id} />}
        <AttachmentInputV3 uploadKey={fileHubUploadKey ?? undefined} uploadWhenKeyProvided={attachmentsToUpload.length > 0} />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            {locale.tasks.modals.editTask.buttons.cancel ?? "Cancel"}
          </button>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {updateMutation.isPending
              ? locale.tasks.modals.editTask.buttons.saving
              : (locale.tasks.modals.editTask?.buttons.save ?? "Update Task")}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
