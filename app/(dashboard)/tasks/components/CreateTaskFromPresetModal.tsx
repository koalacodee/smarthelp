"use client";

import { Fragment, useEffect, useState } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { TaskService } from "@/lib/api/v2";
import { useTaskPresetsStore } from "../store/useTaskPresetsStore";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import { useTaskStore } from "@/lib/store";
import { FileService, TicketAssignee } from "@/lib/api";
import api from "@/lib/api";
import CheckCircle from "@/icons/CheckCircle";
import AttachmentInput from "@/components/ui/AttachmentInput";
import {
  Attachment,
  useAttachmentStore,
} from "@/app/(dashboard)/store/useAttachmentStore";
import { useAttachmentsStore } from "@/lib/store/useAttachmentsStore";
import { useMediaMetadataStore } from "@/lib/store/useMediaMetadataStore";
import { useTaskModalStore } from "../store/useTaskModalStore";
import useFormErrors from "@/hooks/useFormErrors";
import {
  UploadMultipleFilesResponse,
  UploadSingleFileResponse,
} from "@/lib/api/v2/services/shared/upload";

const adminTaskFromPresetSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is Required"),
  departmentId: z.string().min(1, "Department is required"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  dueDate: z.string().optional(),
  reminderDays: z.number().min(0).optional(),
  reminderHours: z.number().min(0).max(23).optional(),
  reminderMinutes: z.number().min(0).max(59).optional(),
});

const supervisorTaskFromPresetSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is Required"),
  targetSubDepartmentId: z.string().min(1, "Sub-department is required"),
  assigneeId: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  dueDate: z.string().optional(),
  reminderDays: z.number().min(0).optional(),
  reminderHours: z.number().min(0).max(23).optional(),
  reminderMinutes: z.number().min(0).max(59).optional(),
});

type AdminTaskFromPresetFormData = z.infer<typeof adminTaskFromPresetSchema>;
type SupervisorTaskFromPresetFormData = z.infer<
  typeof supervisorTaskFromPresetSchema
>;

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

type CreateTaskFromPresetModalProps = {
  role: "admin" | "supervisor";
};

export default function CreateTaskFromPresetModal({
  role,
}: CreateTaskFromPresetModalProps) {
  const {
    clearErrors,
    setErrors,
    setRootError,
    errors: formErrors,
  } = useFormErrors([
    "title",
    "description",
    "departmentId",
    "targetSubDepartmentId",
  ]);

  const { addToast } = useToastStore();
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const {
    getFormData,
    clearAttachments,
    clearExistingsToDelete,
    setExistingAttachments,
  } = useAttachmentStore();

  const { getAttachments, addAttachments } = useAttachmentsStore();
  const { setMetadata } = useMediaMetadataStore();
  const { addTask } = useTaskStore();
  const { departments, subDepartments } = useTaskModalStore();

  const {
    isCreateFromPresetModalOpen,
    setCreateFromPresetModalOpen,
    selectedPreset,
    reset: resetPresetStore,
  } = useTaskPresetsStore();

  const [subDepartmentEmployees, setSubDepartmentEmployees] = useState<
    TicketAssignee[]
  >([]);
  const [changedFields, setChangedFields] = useState<Set<string>>(new Set());

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
    setValue,
  } = useForm<AdminTaskFromPresetFormData | SupervisorTaskFromPresetFormData>({
    resolver: zodResolver(
      role === "admin"
        ? adminTaskFromPresetSchema
        : supervisorTaskFromPresetSchema
    ),
    defaultValues: {
      priority: "MEDIUM",
      reminderDays: 0,
      reminderHours: 0,
      reminderMinutes: 0,
    },
  });

  const selectedSubDepartmentId = watch("targetSubDepartmentId");

  // Initialize form with preset data
  useEffect(() => {
    if (selectedPreset && isCreateFromPresetModalOpen) {
      // Common fields
      setValue("title", selectedPreset.title);
      setValue("description", selectedPreset.description);
      setValue("priority", selectedPreset.priority);

      if (selectedPreset.dueDate) {
        setValue("dueDate", selectedPreset.dueDate);
      }

      if (selectedPreset.reminderInterval) {
        const totalMs = selectedPreset.reminderInterval;
        const days = Math.floor(totalMs / (24 * 60 * 60 * 1000));
        const hours = Math.floor(
          (totalMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)
        );
        const minutes = Math.floor((totalMs % (60 * 60 * 1000)) / (60 * 1000));

        setValue("reminderDays", days);
        setValue("reminderHours", hours);
        setValue("reminderMinutes", minutes);
      }

      // Role-specific fields
      if (role === "admin" && selectedPreset.targetDepartmentId) {
        setValue("departmentId", selectedPreset.targetDepartmentId);
      } else if (role === "supervisor") {
        if (selectedPreset.targetSubDepartmentId) {
          setValue(
            "targetSubDepartmentId",
            selectedPreset.targetSubDepartmentId
          );
        }
        if (selectedPreset.assigneeId) {
          setValue("assigneeId", selectedPreset.assigneeId);
        }
      }
    }
  }, [selectedPreset, isCreateFromPresetModalOpen, setValue, role]);

  // Track field changes
  const handleFieldChange = (fieldName: string) => {
    setChangedFields((prev) => new Set(prev).add(fieldName));
  };

  useEffect(() => {
    if (selectedSubDepartmentId) {
      api.EmployeeService.getEmployeesBySubDepartment(
        selectedSubDepartmentId
      ).then((val) => {
        setSubDepartmentEmployees(val);
      });
    }
  }, [selectedSubDepartmentId]);

  const handleClose = () => {
    // Clear attachment store state
    clearAttachments();
    clearExistingsToDelete();
    setExistingAttachments({});

    // Reset form and close modal
    reset();
    setCreateFromPresetModalOpen(false);
    resetPresetStore();
    setChangedFields(new Set());
  };

  const onSubmit = async (
    data: AdminTaskFromPresetFormData | SupervisorTaskFromPresetFormData
  ) => {
    if (!selectedPreset) {
      addToast({
        message: "No preset selected. Please try again.",
        type: "error",
      });
      return;
    }

    clearErrors();
    try {
      // Calculate reminder in milliseconds
      const reminderMs = calculateReminderMilliseconds(
        data.reminderDays,
        data.reminderHours,
        data.reminderMinutes
      );

      // Prepare request object with only changed fields
      const requestData: any = {
        presetId: selectedPreset.id,
      };

      // Add changed fields to request
      if (changedFields.has("title")) requestData.title = data.title;
      if (changedFields.has("description"))
        requestData.description = data.description;
      if (changedFields.has("priority")) requestData.priority = data.priority;
      if (changedFields.has("dueDate"))
        requestData.dueDate = data.dueDate || undefined;
      if (
        changedFields.has("reminderDays") ||
        changedFields.has("reminderHours") ||
        changedFields.has("reminderMinutes")
      ) {
        requestData.reminderInterval = reminderMs;
      }

      if (role === "admin") {
        const adminData = data as AdminTaskFromPresetFormData;
        if (changedFields.has("departmentId")) {
          requestData.targetDepartmentId = adminData.departmentId;
        }
      } else {
        const supervisorData = data as SupervisorTaskFromPresetFormData;
        if (changedFields.has("targetSubDepartmentId")) {
          requestData.targetSubDepartmentId =
            supervisorData.targetSubDepartmentId;
        }
        if (changedFields.has("assigneeId")) {
          requestData.assigneeId = supervisorData.assigneeId || undefined;
          if (supervisorData.assigneeId) {
            requestData.assignmentType = "INDIVIDUAL";
          } else {
            requestData.assignmentType = "SUB_DEPARTMENT";
          }
        }
      }

      // Get FormData from attachment store
      const formData = attachments.length > 0 ? getFormData() : undefined;
      if (attachments.length > 0) {
        requestData.attach = true;
      }

      const response = await TaskService.createTaskFromPreset(requestData);
      const createdTask = response.task;
      addTask(createdTask as any);

      // Handle attachments if any
      if (response.uploadKey && formData) {
        let uploaded:
          | UploadMultipleFilesResponse
          | UploadSingleFileResponse
          | undefined = undefined;

        if (response.uploadKey && formData) {
          uploaded = (await FileService.upload(response.uploadKey, formData))
            ?.data;
        }

        if (uploaded && uploaded) {
          if (Array.isArray(uploaded)) {
            addAttachments(
              "task",
              createdTask.id,
              uploaded.map((f: any) => f.id)
            );
            uploaded.forEach((f: any) =>
              setMetadata(f.id, {
                fileType: f.fileType,
                originalName: f.originalName,
                sizeInBytes: f.sizeInBytes,
                expiryDate: (f.expirationDate ?? null) as any,
                contentType: f.contentType,
              })
            );
          } else if (uploaded.id) {
            addAttachments("task", createdTask.id, [uploaded.id]);
            setMetadata(uploaded.id, {
              fileType: uploaded.fileType,
              originalName: uploaded.originalName,
              sizeInBytes: uploaded.sizeInBytes,
              expiryDate: (uploaded.expirationDate ?? null) as any,
              contentType: uploaded.contentType,
            });
          }
        }
      }

      addToast({
        message: "Task created successfully from preset!",
        type: "success",
      });

      // Clear attachment store state
      clearAttachments();
      clearExistingsToDelete();
      setExistingAttachments({});

      // Reset and close
      reset();
      setCreateFromPresetModalOpen(false);
      resetPresetStore();
      setChangedFields(new Set());
    } catch (error: any) {
      console.error("Create task from preset error:", error);

      if (error?.response?.data?.data?.details) {
        setErrors(error?.response?.data?.data?.details);
      } else {
        setRootError(
          error?.response?.data?.message ||
            "Failed to create task from preset. Please try again."
        );
      }
    }
  };

  return (
    <Transition appear show={isCreateFromPresetModalOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-[1000]"
        onClose={() => setCreateFromPresetModalOpen(false)}
      >
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-background p-6 text-left align-middle shadow-xl transition-all">
                <DialogTitle
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 flex items-center gap-2"
                >
                  <CheckCircle className="w-5 h-5 text-primary" />
                  Create Task from Preset: {selectedPreset?.name}
                </DialogTitle>

                {formErrors.root && (
                  <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
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
                      <span>{formErrors.root}</span>
                    </div>
                  </div>
                )}

                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="mt-4 space-y-4"
                >
                  <div>
                    <input
                      {...register("title")}
                      className="w-full border border-border rounded-md p-2 bg-background"
                      placeholder="Task Title"
                      type="text"
                      onChange={(e) => {
                        register("title").onChange(e);
                        handleFieldChange("title");
                      }}
                    />
                    {errors.title && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.title.message}
                      </p>
                    )}
                    {formErrors.title && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.title}
                      </p>
                    )}
                  </div>

                  {role === "admin" ? (
                    <div>
                      <label
                        htmlFor="team-task-dept"
                        className="block text-sm font-medium text-muted-foreground mb-1"
                      >
                        Department
                      </label>
                      <select
                        {...register("departmentId")}
                        id="team-task-dept"
                        className="w-full border border-border rounded-md p-2 bg-background"
                        onChange={(e) => {
                          register("departmentId").onChange(e);
                          handleFieldChange("departmentId");
                        }}
                      >
                        <option value="">Select Department</option>
                        {departments?.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                      {(errors as any).departmentId && (
                        <p className="text-red-500 text-xs mt-1">
                          {(errors as any).departmentId.message}
                        </p>
                      )}
                      {formErrors.departmentId && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.departmentId}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="team-task-subdept"
                          className="block text-sm font-medium text-muted-foreground mb-1"
                        >
                          Sub-department
                        </label>
                        <select
                          {...register("targetSubDepartmentId")}
                          id="team-task-subdept"
                          className="w-full border border-border rounded-md p-2 bg-background"
                          onChange={(e) => {
                            register("targetSubDepartmentId").onChange(e);
                            handleFieldChange("targetSubDepartmentId");
                          }}
                        >
                          <option value="">Select Sub-department</option>
                          {subDepartments.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                              {dept.name}
                            </option>
                          ))}
                        </select>
                        {(errors as any).targetSubDepartmentId && (
                          <p className="text-red-500 text-xs mt-1">
                            {(errors as any).targetSubDepartmentId.message}
                          </p>
                        )}
                        {formErrors.targetSubDepartmentId && (
                          <p className="text-red-500 text-xs mt-1">
                            {formErrors.targetSubDepartmentId}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="team-task-employee"
                          className="block text-sm font-medium text-muted-foreground mb-1"
                        >
                          Assign To
                        </label>
                        <select
                          {...register("assigneeId")}
                          id="team-task-employee"
                          className="w-full border border-border rounded-md p-2 bg-background"
                          disabled={!selectedSubDepartmentId}
                          onChange={(e) => {
                            register("assigneeId").onChange(e);
                            handleFieldChange("assigneeId");
                          }}
                        >
                          <option value="">(Entire Sub-department)</option>
                          {subDepartmentEmployees.map((employee) => (
                            <option key={employee.id} value={employee.id}>
                              {employee.user.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="team-task-priority"
                        className="block text-sm font-medium text-muted-foreground mb-1"
                      >
                        Priority
                      </label>
                      <select
                        {...register("priority")}
                        id="team-task-priority"
                        className="w-full border border-border rounded-md p-2 bg-background"
                        onChange={(e) => {
                          register("priority").onChange(e);
                          handleFieldChange("priority");
                        }}
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="team-task-due-date"
                        className="block text-sm font-medium text-muted-foreground mb-1"
                      >
                        Due Date
                      </label>
                      <input
                        {...register("dueDate")}
                        id="team-task-due-date"
                        type="date"
                        className="w-full border border-border rounded-md p-2 bg-background"
                        onChange={(e) => {
                          register("dueDate").onChange(e);
                          handleFieldChange("dueDate");
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Reminder Interval (Optional)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label
                          htmlFor="reminder-days"
                          className="block text-xs text-muted-foreground mb-1"
                        >
                          Days
                        </label>
                        <input
                          {...register("reminderDays", { valueAsNumber: true })}
                          id="reminder-days"
                          type="number"
                          min="0"
                          placeholder="0"
                          className="w-full border border-border rounded-md p-2 bg-background text-sm"
                          onChange={(e) => {
                            register("reminderDays", {
                              valueAsNumber: true,
                            }).onChange(e);
                            handleFieldChange("reminderDays");
                          }}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="reminder-hours"
                          className="block text-xs text-muted-foreground mb-1"
                        >
                          Hours
                        </label>
                        <input
                          {...register("reminderHours", {
                            valueAsNumber: true,
                          })}
                          id="reminder-hours"
                          type="number"
                          min="0"
                          max="23"
                          placeholder="0"
                          className="w-full border border-border rounded-md p-2 bg-background text-sm"
                          onChange={(e) => {
                            register("reminderHours", {
                              valueAsNumber: true,
                            }).onChange(e);
                            handleFieldChange("reminderHours");
                          }}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="reminder-minutes"
                          className="block text-xs text-muted-foreground mb-1"
                        >
                          Minutes
                        </label>
                        <input
                          {...register("reminderMinutes", {
                            valueAsNumber: true,
                          })}
                          id="reminder-minutes"
                          type="number"
                          min="0"
                          max="59"
                          placeholder="0"
                          className="w-full border border-border rounded-md p-2 bg-background text-sm"
                          onChange={(e) => {
                            register("reminderMinutes", {
                              valueAsNumber: true,
                            }).onChange(e);
                            handleFieldChange("reminderMinutes");
                          }}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Set a recurring reminder interval
                    </p>
                  </div>

                  <div>
                    <textarea
                      {...register("description")}
                      rows={3}
                      className="w-full border border-border rounded-md p-2"
                      placeholder="Description"
                      onChange={(e) => {
                        register("description").onChange(e);
                        handleFieldChange("description");
                      }}
                    />
                    {errors.description && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.description.message}
                      </p>
                    )}
                    {formErrors.description && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.description}
                      </p>
                    )}
                  </div>

                  <AttachmentInput
                    id="task-attachment"
                    onAttachmentsChange={setAttachments}
                    attachmentType="task"
                    getAttachmentTokens={getAttachments}
                  />

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {isSubmitting ? "Creating..." : "Create Task"}
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
