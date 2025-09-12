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
import { Department } from "@/lib/api/departments";
import { TicketAssignee } from "@/lib/api";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import Plus from "@/icons/Plus";
import CheckCircle from "@/icons/CheckCircle";

const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is Required"),
  targetSubDepartmentId: z.string().min(1, "Sub-department is required"),
  assigneeId: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  dueDate: z.string().optional(),
});

type CreateTaskFormData = z.infer<typeof createTaskSchema>;

export default function AddTaskModal({
  isOpen,
  onClose,
  subDepartments,
  refreshTasks,
}: {
  isOpen: boolean;
  onClose: () => void;
  subDepartments: Department[];
  refreshTasks: () => Promise<void>;
}) {
  const { addToast } = useToastStore();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      priority: "MEDIUM",
    },
  });

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

  const onSubmit = async (data: CreateTaskFormData) => {
    try {
      let assignmentType: TaskAssignmentType;

      if (data.assigneeId) {
        assignmentType = TaskAssignmentType.INDIVIDUAL;
      } else {
        assignmentType = TaskAssignmentType.SUB_DEPARTMENT;
      }

      const createTaskDto: CreateTaskDto = {
        assignmentType,
        title: data.title,
        description: data.description || "",
        targetSubDepartmentId: data.targetSubDepartmentId,
        assigneeId: data.assigneeId || undefined,
        priority: data.priority,
        dueDate: data.dueDate,
      };

      await api.TasksService.createTask(createTaskDto);

      addToast({
        message: "Task created successfully!",
        type: "success",
      });

      reset();
      await refreshTasks();
      onClose();
    } catch (error) {
      addToast({
        message: "Failed to create task. Please try again.",
        type: "error",
      });
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[1000]" onClose={onClose}>
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
                  </div>

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
                      {errors.targetSubDepartmentId && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.targetSubDepartmentId.message}
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
                    <textarea
                      {...register("description")}
                      rows={3}
                      className="w-full border border-border rounded-md p-2"
                      placeholder="Description"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={onClose}
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
