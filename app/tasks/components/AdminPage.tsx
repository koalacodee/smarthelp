"use client";

import { useState, useEffect } from "react";
import { useAdminTasksStore } from "../store/useAdminTasksStore";
import { DepartmentsService, TasksService } from "@/lib/api";
import { CreateTaskDto, TaskAssignmentType } from "@/lib/api/tasks";
import { Department } from "@/lib/api/departments";
import { useConfirmationModalStore } from "@/app/store/useConfirmationStore";
import { useUserStore } from "@/app/store/useUserStore";

export default function AdminPage() {
  const { tasks, setTasks, addTask, removeTask, loading, setLoading } =
    useAdminTasksStore();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignmentType: TaskAssignmentType.DEPARTMENT,
    targetDepartmentId: "",
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const { openModal } = useConfirmationModalStore();
  const { user } = useUserStore();

  useEffect(() => {
    if (user?.role === "ADMIN") {
      loadTasks();
      loadDepartments();
    }
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await TasksService.getDepartmentLevel();
      setTasks(response.data);
    } catch (error) {
      console.error("Failed to load tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const response = await DepartmentsService.getAllDepartments();
      setDepartments(response);
      setFormData((prev) => ({
        ...prev,
        targetDepartmentId: response[0].id,
      }));
    } catch (error) {
      console.error("Failed to load departments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const createDto: CreateTaskDto = {
        title: formData.title,
        description: formData.description,
        assignmentType: formData.assignmentType,
        targetDepartmentId: formData.targetDepartmentId ?? departments[0]?.id,
      };

      const newTask = await TasksService.createTask(createDto);
      addTask(newTask);

      // Reset form
      setFormData({
        title: "",
        description: "",
        assignmentType: TaskAssignmentType.DEPARTMENT,
        targetDepartmentId: "",
      });
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  const handleDelete = async (id: string) => {
    openModal({
      title: "Delete Task",
      message: "Are you sure you want to delete this task?",
      onConfirm: async () => {
        try {
          await TasksService.deleteTask(id);
          removeTask(id);
        } catch (error) {
          console.error("Failed to delete task:", error);
        }
      },
    });
  };

  return (
    <>
      {user?.role === "ADMIN" && (
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold text-slate-800">
              Assign Task to Supervisor Category
            </h3>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="task-title"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Task Title
                  </label>
                  <input
                    id="task-title"
                    className="w-full border border-slate-300 rounded-md p-2"
                    placeholder="e.g., Review pending tickets"
                    required
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor="task-category"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Assign To
                  </label>
                  <select
                    id="task-category"
                    className="w-full border border-slate-300 rounded-md p-2 bg-white"
                    required
                    value={formData.targetDepartmentId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        targetDepartmentId: e.target.value,
                      })
                    }
                  >
                    {departments.map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <textarea
                id="task-description"
                rows={3}
                className="w-full border border-slate-300 rounded-md p-2"
                placeholder="Description (Optional)"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Task"}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
              Tasks for Supervisors
            </h3>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-slate-600">Loading tasks...</p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500">No tasks found</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Assigned To
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Last Update
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {tasks.map((task) => (
                      <tr
                        key={task.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              task.status === "COMPLETED"
                                ? "bg-green-100 text-green-800"
                                : task.status === "PENDING_REVIEW"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {task.status || "TODO"}
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
                          {task.targetDepartment?.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {task.updatedAt
                            ? new Date(task.updatedAt).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleDelete(task.id!)}
                              className="text-slate-500 hover:text-red-600 p-1"
                              aria-label="Delete task"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="w-4 h-4"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.134H8.09a2.09 2.09 0 0 0-2.09 2.134v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
