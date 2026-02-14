"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { DialogTitle } from "@headlessui/react";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import { useV2TaskPageStore } from "../../_store/use-v2-task-page-store";
import { useCreateTask } from "@/services/tasks";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import { useAttachments } from "@/hooks/useAttachments";
import { useTaskStore } from "@/services/tasks/store";
import ModalShell from "./ModalShell";
import TaskFormFields from "../task-form/TaskFormFields";
import TaskAssignmentFields from "../task-form/TaskAssignmentFields";
import AttachmentInputV3 from "@/app/(dashboard)/files/components/v3/AttachmentInput";
import type {
  TaskPresetResponse,
  CreateTaskRequest,
  TaskStatus,
} from "@/services/tasks/types";

export default function CreateFromPresetModal() {
  const locale = useLocaleStore((state) => state.locale);
  const { activeModal, modalPayload, closeModal, role } = useV2TaskPageStore();
  const { addToast } = useToastStore();
  const createMutation = useCreateTask();
  const { fileHubUploadKey } = useTaskStore();
  const { selectedFormMyAttachments } = useAttachments();
  const [departmentId, setDepartmentId] = useState("");
  const [error, setError] = useState("");

  const preset = modalPayload as TaskPresetResponse | null;
  const isOpen = activeModal === "create-from-preset" && !!preset;

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
    if (preset) {
      reset({
        title: preset.title,
        description: preset.description,
        priority: preset.priority || "MEDIUM",
        dueDate: preset.dueDate
          ? new Date(preset.dueDate).toISOString().slice(0, 16)
          : "",
      });
      setDepartmentId(
        preset.targetDepartmentId ?? preset.targetSubDepartmentId ?? "",
      );
    }
  }, [preset, reset]);

  const handleClose = () => {
    reset();
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
        assigneeId: preset?.assigneeId ?? undefined,
        attach: selectedFormMyAttachments.length > 0,
        chooseAttachments:
          selectedFormMyAttachments.length > 0
            ? selectedFormMyAttachments.map((a) => a.id)
            : undefined,
      };
      await createMutation.mutateAsync(req);
      addToast({
        message:
          locale?.tasks.toasts?.taskCreated ?? "Task created from preset",
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
        className="text-lg font-medium leading-6 text-gray-900"
      >
        {locale.tasks.modals.presets?.createFromPreset ??
          "Create Task from Preset"}
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
        <AttachmentInputV3 uploadKey={fileHubUploadKey ?? undefined} />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            {locale.tasks.modals.presets?.buttons.close ?? "Cancel"}
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {createMutation.isPending
              ? (locale.tasks.modals.presets?.buttons.creating ?? "Creating...")
              : (locale.tasks.modals.presets?.buttons.create ?? "Create Task")}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
