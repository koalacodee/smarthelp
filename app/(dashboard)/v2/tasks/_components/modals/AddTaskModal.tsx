"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { DialogTitle } from "@headlessui/react";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import { useV2TaskPageStore } from "../../_store/use-v2-task-page-store";
import { useCreateTask } from "@/services/tasks";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import { useAttachments } from "@/hooks/useAttachments";
import ModalShell from "./ModalShell";
import TaskFormFields from "../task-form/TaskFormFields";
import TaskAssignmentFields from "../task-form/TaskAssignmentFields";
import TaskRemindersInput, {
  type SpecificReminderEntry,
} from "../task-form/TaskRemindersInput";
import AttachmentInputV3 from "@/app/(dashboard)/files/components/v3/AttachmentInput";
import { useTaskStore } from "@/services/tasks/store";
import type { CreateTaskRequest, TaskStatus } from "@/services/tasks/types";

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

export default function AddTaskModal() {
  const locale = useLocaleStore((state) => state.locale);
  const { activeModal, closeModal, role } = useV2TaskPageStore();
  const { addToast } = useToastStore();
  const createMutation = useCreateTask();
  const { fileHubUploadKey } = useTaskStore();
  const { selectedFormMyAttachments, attachmentsToUpload } = useAttachments();
  const [departmentId, setDepartmentId] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [reminders, setReminders] = useState<SpecificReminderEntry[]>([]);
  const [saveAsPreset, setSaveAsPreset] = useState(false);
  const [error, setError] = useState("");

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

  const isOpen = activeModal === "add-task";

  const handleClose = () => {
    reset();
    setDepartmentId("");
    setAssigneeId("");
    setReminders([]);
    setSaveAsPreset(false);
    setError("");
    closeModal();
  };

  const onSubmit = async (data: any) => {
    setError("");
    try {
      const req: CreateTaskRequest = {
        title: data.title,
        description: data.description,
        priority: data.priority,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        targetDepartmentId: role === "admin" ? departmentId : undefined,
        targetSubDepartmentId: role === "supervisor" ? departmentId : undefined,
        assigneeId:
          role === "supervisor" && assigneeId ? assigneeId : undefined,
        attach: attachmentsToUpload.length > 0,
        reminders: buildReminders(reminders),
        savePreset: saveAsPreset,
        chooseAttachments:
          selectedFormMyAttachments.length > 0
            ? selectedFormMyAttachments.map((a) => a.id)
            : undefined,
      };
      await createMutation.mutateAsync(req);
      addToast({
        message: locale?.tasks.toasts?.taskCreated ?? "Task created",
        type: "success",
      });
      handleClose();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to create task");
    }
  };

  if (!locale) return null;

  return (
    <ModalShell isOpen={isOpen} onClose={handleClose} size="lg">
      <DialogTitle
        as="h3"
        className="text-lg font-medium leading-6 text-gray-900 flex items-center gap-2"
      >
        {locale.tasks.modals.addTask.title}
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
          assigneeId={assigneeId}
          onAssigneeChange={setAssigneeId}
        />
        <TaskRemindersInput
          specificReminders={reminders}
          onSpecificRemindersChange={setReminders}
        />
        <AttachmentInputV3 uploadKey={fileHubUploadKey ?? undefined} uploadWhenKeyProvided={true} />
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="savePreset"
            checked={saveAsPreset}
            onChange={(e) => setSaveAsPreset(e.target.checked)}
          />
          <label htmlFor="savePreset" className="text-sm text-muted-foreground">
            {locale.tasks.modals.addTask.fields.saveAsPreset}
          </label>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            {locale.tasks.modals.addTask.buttons.cancel}
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
          >
            {createMutation.isPending
              ? locale.tasks.modals.addTask.buttons.creating
              : locale.tasks.modals.addTask.buttons.create}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
