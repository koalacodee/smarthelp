"use client";
import { useUserStore } from "@/app/store/useUserStore";
import { useToastStore } from "@/app/store/useToastStore";
import { useSupervisorTasksStore } from "@/app/store/useSupervisorTasksStore";
import SubmitWorkButton from "./SubmitWorkButton";
import SubmitWorkModal from "./SubmitWorkModal";
import api, { TicketAssignee } from "@/lib/api";
import { Department } from "@/lib/api/departments";
import { CreateTaskDto, TaskAssignmentType } from "@/lib/api/tasks";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is Required"),
  targetSubDepartmentId: z.string().min(1, "Sub-department is required"),
  assigneeId: z.string().optional(),
});

type CreateTaskFormData = z.infer<typeof createTaskSchema>;

export default function SupervisorPage() {
  const { user } = useUserStore();
  const { addToast } = useToastStore();
  const {
    subDepartmentTasks,
    employeeTasks,
    isLoading,
    error,
    fetchSubDepartmentTasks,
    fetchEmployeeTasks,
    refreshTasks,
  } = useSupervisorTasksStore();
  const [subDepartments, setSubDepartments] = useState<Department[]>([]);
  const [subDepartmentEmployees, setSubDepartmentEmployees] = useState<
    TicketAssignee[]
  >([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
    setValue,
  } = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
  });

  const selectedSubDepartmentId = watch("targetSubDepartmentId");
  const selectedAssigneeId = watch("assigneeId");

  useEffect(() => {
    if (selectedSubDepartmentId) {
      api.EmployeeService.getEmployeesBySubDepartment(
        selectedSubDepartmentId
      ).then((val) => {
        setSubDepartmentEmployees(val);
      });
    }
  }, [selectedSubDepartmentId]);

  useEffect(() => {
    api.DepartmentsService.getAllSubDepartments().then((val) => {
      setSubDepartments(val);
    });

    // Fetch tasks on mount
    fetchSubDepartmentTasks();
    fetchEmployeeTasks();
  }, [fetchSubDepartmentTasks, fetchEmployeeTasks]);

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
      };

      await api.TasksService.createTask(createTaskDto);

      addToast({
        message: "Task created successfully!",
        type: "success",
      });

      reset();

      // Refresh tasks after creating a new one
      await refreshTasks();
    } catch (error) {
      addToast({
        message: "Failed to create task. Please try again.",
        type: "error",
      });
    }
  };

  return (
    <>
      {user?.role == "SUPERVISOR" && (
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-6 h-6 text-slate-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2Z"
                />
              </svg>
              Assign Task to Your Team
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
              <div>
                <input
                  {...register("title")}
                  className="w-full border border-slate-300 rounded-md p-2"
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
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Sub-department
                  </label>
                  <select
                    {...register("targetSubDepartmentId")}
                    id="team-task-subdept"
                    className="w-full border border-slate-300 rounded-md p-2 bg-white"
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
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Assign To Employee (Optional)
                  </label>
                  <select
                    {...register("assigneeId")}
                    id="team-task-employee"
                    className="w-full border border-slate-300 rounded-md p-2 bg-white"
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

              <div>
                <textarea
                  {...register("description")}
                  rows={3}
                  className="w-full border border-slate-300 rounded-md p-2"
                  placeholder="Description (Optional)"
                />
              </div>

              <div>
                <label
                  htmlFor="team-task-attachment"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Attach File (Optional)
                </label>
                <input
                  id="team-task-attachment"
                  accept="*"
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  type="file"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Creating..." : "Assign Task"}
                </button>
              </div>
            </form>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-6 h-6 text-slate-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2Z"
                />
              </svg>
              Team Tasks
            </h3>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                    >
                      Title
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                    >
                      Assigned To
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                    >
                      Last Update
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-8 text-center text-slate-500"
                      >
                        Loading tasks...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-8 text-center text-red-500"
                      >
                        {error}
                      </td>
                    </tr>
                  ) : [...subDepartmentTasks, ...employeeTasks].length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-8 text-center text-slate-500"
                      >
                        No tasks found
                      </td>
                    </tr>
                  ) : (
                    <>
                      {employeeTasks.map((task) => (
                        <tr
                          key={task.id}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                task.status === "PENDING_REVIEW"
                                  ? "bg-blue-100 text-blue-800"
                                  : task.status === "SEEN"
                                  ? "bg-amber-100 text-amber-800"
                                  : task.status === "COMPLETED"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {task?.status?.replace("_", " ")}
                            </span>
                          </td>
                          <td className="px-6 py-4 max-w-xs">
                            <p
                              className="text-sm font-semibold text-slate-900 truncate"
                              title={task.title}
                            >
                              {task.title}
                            </p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                            {task.assignee?.user?.name || "Unassigned"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            {new Date(
                              task.updatedAt || new Date()
                            ).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <SubmitWorkButton task={task} />
                            </div>
                          </td>
                        </tr>
                      ))}
                      {subDepartmentTasks.map((task) => (
                        <tr
                          key={task.id}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                task.status === "PENDING_REVIEW"
                                  ? "bg-blue-100 text-blue-800"
                                  : task.status === "SEEN"
                                  ? "bg-amber-100 text-amber-800"
                                  : task.status === "COMPLETED"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {task?.status?.replace("_", " ")}
                            </span>
                          </td>
                          <td className="px-6 py-4 max-w-xs">
                            <p
                              className="text-sm font-semibold text-slate-900 truncate"
                              title={task.title}
                            >
                              {task.title}
                            </p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                            {task.targetSubDepartment?.name || "Unassigned"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            {new Date(
                              task.updatedAt || new Date()
                            ).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              {<SubmitWorkButton task={task} />}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      <SubmitWorkModal />
    </>
  );
}
