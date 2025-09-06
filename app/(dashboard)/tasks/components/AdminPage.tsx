"use client";

import { useState, useEffect } from "react";
import { useAdminTasksStore } from "../store/useAdminTasksStore";
import { DepartmentsService, TasksService } from "@/lib/api";
import { CreateTaskDto, TaskAssignmentType } from "@/lib/api/tasks";
import { Department } from "@/lib/api/departments";
import { useConfirmationModalStore } from "@/app/(dashboard)/store/useConfirmationStore";
import { useUserStore } from "@/app/(dashboard)/store/useUserStore";

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
    console.log("User role:", user?.role);
    if (user?.role === "ADMIN") {
      console.log("Loading tasks and departments for admin...");
      loadTasks();
      loadDepartments();
    } else {
      console.log("Not admin, skipping load");
    }
  }, [user]);

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
      console.log("Depart Loaded", response);

      if (response && Array.isArray(response) && response.length > 0) {
        setDepartments(response);
        setFormData((prev) => ({
          ...prev,
          targetDepartmentId: response[0].id,
        }));
      } else {
        console.warn("No departments found or invalid response format");
        setDepartments([]);
      }
    } catch (error) {
      console.error("Failed to load departments:", error);
      setDepartments([]);
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
            <h3 className="text-xl font-bold text-foreground">
              Assign Task to Supervisor Category
            </h3>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="task-title"
                    className="block text-sm font-medium text-muted-foreground mb-1"
                  >
                    Task Title
                  </label>
                  <input
                    id="task-title"
                    className="w-full border border-border rounded-md p-2 bg-background"
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
                    className="block text-sm font-medium text-muted-foreground mb-1"
                  >
                    Assign To
                  </label>
                  <select
                    id="task-category"
                    className="w-full border border-border rounded-md p-2 bg-background"
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
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Task"}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-3">
              Tasks for Supervisors
            </h3>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Loading tasks...</p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No tasks found</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-border rounded-lg">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted/50">
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
                      <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-background divide-y divide-border">
                    {tasks.map((task) => (
                      <tr
                        key={task.id}
                        className="hover:bg-muted/50 transition-colors"
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
                            className="text-sm font-semibold text-foreground truncate"
                            title={task.title}
                          >
                            {task.title}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {task.targetDepartment?.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {task.updatedAt
                            ? new Date(task.updatedAt).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleDelete(task.id!)}
                              className="text-muted-foreground hover:text-destructive p-1"
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
