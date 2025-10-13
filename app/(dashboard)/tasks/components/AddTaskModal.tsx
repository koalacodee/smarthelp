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
import { CreateTaskDto, TaskAssignmentType } from "@/lib/api/tasks";
import api from "@/lib/api";
import { TicketAssignee } from "@/lib/api";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import Plus from "@/icons/Plus";
import CheckCircle from "@/icons/CheckCircle";
import { useTaskModalStore } from "../store/useTaskModalStore";
import AttachmentInput from "@/components/ui/AttachmentInput";
import {
  Attachment,
  useAttachmentStore,
} from "@/app/(dashboard)/store/useAttachmentStore";
import { useAttachmentsStore } from "@/lib/store/useAttachmentsStore";
import { useTaskStore } from "@/lib/store";
import { useMediaMetadataStore } from "@/lib/store/useMediaMetadataStore";
import useFormErrors from "@/hooks/useFormErrors";

const adminTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is Required"),
  departmentId: z.string().min(1, "Department is required"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  dueDate: z.string().optional(),
  reminderDays: z.number().min(0).optional(),
  reminderHours: z.number().min(0).max(23).optional(),
  reminderMinutes: z.number().min(0).max(59).optional(),
  saveAsPreset: z.boolean().optional(),
});

const supervisorTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is Required"),
  targetSubDepartmentId: z.string().min(1, "Sub-department is required"),
  assigneeId: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  dueDate: z.string().optional(),
  reminderDays: z.number().min(0).optional(),
  reminderHours: z.number().min(0).max(23).optional(),
  reminderMinutes: z.number().min(0).max(59).optional(),
  saveAsPreset: z.boolean().optional(),
});

type AdminTaskFormData = z.infer<typeof adminTaskSchema>;
type SupervisorTaskFormData = z.infer<typeof supervisorTaskSchema>;

type AddTaskModalProps = {
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

export default function AddTaskModal({ role }: AddTaskModalProps) {
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
    selectedAttachmentIds,
    moveAllSelectedToExisting,
  } = useAttachmentStore();
  const { getAttachments, addAttachments, removeAttachments } =
    useAttachmentsStore();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm<AdminTaskFormData | SupervisorTaskFormData>({
    resolver: zodResolver(
      role === "admin" ? adminTaskSchema : supervisorTaskSchema
    ),
    defaultValues: {
      priority: "MEDIUM",
      // Keep numeric defaults; treat 0/0/0 as no reminder at submit time
      reminderDays: 0,
      reminderHours: 0,
      reminderMinutes: 0,
    },
  });

  const { isOpen, setOpen, subDepartments, departments } = useTaskModalStore();

  const { addTask } = useTaskStore();
  const { setMetadata } = useMediaMetadataStore();
  const [subDepartmentEmployees, setSubDepartmentEmployees] = useState<
    TicketAssignee[]
  >([]);

  const selectedSubDepartmentId = watch("targetSubDepartmentId");

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
    setOpen(false);
  };

  const onSubmit = async (data: AdminTaskFormData | SupervisorTaskFormData) => {
    clearErrors();
    try {
      let createTaskDto: CreateTaskDto;

      // Calculate reminder in milliseconds
      const reminderMs = calculateReminderMilliseconds(
        data.reminderDays,
        data.reminderHours,
        data.reminderMinutes
      );

      if (role === "admin") {
        const adminData = data as AdminTaskFormData;
        createTaskDto = {
          assignmentType: TaskAssignmentType.DEPARTMENT,
          title: adminData.title,
          description: adminData.description || "",
          targetDepartmentId: adminData.departmentId,
          priority: adminData.priority,
          dueDate: adminData.dueDate || undefined,
          reminderInterval: reminderMs,
          savePreset: adminData.saveAsPreset,
          chooseAttachments: Array.from(selectedAttachmentIds),
        };
      } else {
        const supervisorData = data as SupervisorTaskFormData;
        const assignmentType = supervisorData.assigneeId
          ? TaskAssignmentType.INDIVIDUAL
          : TaskAssignmentType.SUB_DEPARTMENT;

        createTaskDto = {
          assignmentType,
          title: supervisorData.title,
          description: supervisorData.description || "",
          targetSubDepartmentId: supervisorData.targetSubDepartmentId,
          assigneeId: supervisorData.assigneeId || undefined,
          priority: supervisorData.priority,
          dueDate: supervisorData.dueDate || undefined,
          reminderInterval: reminderMs,
          savePreset: supervisorData.saveAsPreset,
          chooseAttachments: Array.from(selectedAttachmentIds),
        };
      }

      // Get FormData from attachment store
      const formData = attachments.length > 0 ? getFormData() : undefined;

      const createdResp = await api.TasksService.createTask(
        createTaskDto,
        formData
      );
      const createdTask = createdResp?.task ?? createdResp;
      addTask(createdTask);

      // Store newly uploaded attachments from API response (no refetch)
      const uploaded = createdResp?.uploaded;
      if (uploaded) {
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

      addToast({
        message: "Task created successfully!",
        type: "success",
      });

      // Clear attachment store state
      clearAttachments();
      clearExistingsToDelete();
      setExistingAttachments({});
      moveAllSelectedToExisting();
      reset();
      setOpen(false);
    } catch (error: any) {
      console.error("Create task error:", error);
      console.log("Create task error:", error);
      console.log("Error response data:", error?.response?.data);

      if (error?.response?.data?.data?.details) {
        console.log(
          "Setting field errors:",
          error?.response?.data?.data?.details
        );
        setErrors(error?.response?.data?.data?.details);
      } else {
        console.log("Setting root error");
        setRootError(
          error?.response?.data?.message ||
            "Failed to create task. Please try again."
        );
      }
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-[1000]"
        onClose={() => setOpen(false)}
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
                  <Plus className="w-5 h-5 text-primary" />
                  Assign New Task
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
                          defaultValue={0}
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
                          defaultValue={0}
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
                          defaultValue={0}
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

                  {/* Save as Preset Checkbox & Description */}
                  <div className="mt-6 mb-2">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="accent-primary w-5 h-5 rounded"
                        {...register("saveAsPreset")}
                      />
                      <span className="font-medium text-primary select-none">
                        Save Task As Preset
                      </span>
                    </label>
                    <p className="text-xs mt-2 text-muted-foreground max-w-xl">
                      <span className="block">
                        <b>What is a Preset?</b> Save this task as a reusable
                        template to quickly create similar tasks in the future.
                        Presets let you predefine task fields, so you can assign
                        recurring or standardized tasks with just a few clicks.
                      </span>
                    </p>
                  </div>

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
