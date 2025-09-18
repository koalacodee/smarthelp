"use client";
import { MyTasksApiResponse } from "@/lib/api/types/my-tasks.types";
import { MyTasksResponse } from "@/lib/api";
import MyTasksDashboard from "./MyTasksDashboard";
import MyTasksFilters from "./MyTasksFilters";
import MyTasksActions from "./MyTasksActions";
import { useSubmitWorkModalStore } from "@/app/(dashboard)/store/useSubmitWorkModalStore";
import SubmitWorkModal from "../../components/SubmitWorkModal";

const getDueDateStatus = (dueDate: string, status: string) => {
  if (status === "COMPLETED") {
    return (
      <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded">
        Completed
      </span>
    );
  }

  const today = new Date();
  const due = new Date(dueDate);
  const formattedDate = due.toLocaleDateString("en-US", {
    month: "short", // Sep
    day: "numeric", // 4
    year: "numeric", // 2025
  });

  if (due < today) {
    return (
      <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded">
        Due: {formattedDate} (Overdue)
      </span>
    );
  }

  return (
    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
      Due: {formattedDate} (Upcoming)
    </span>
  );
};

export default function MyTasks({ data }: { data: MyTasksResponse }) {
  const { openModal } = useSubmitWorkModalStore();

  const onTaskClick = (task: (typeof data.tasks)[0]) => {
    openModal(task);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_3fr] gap-5 max-w-[1400px] mx-auto">
      <MyTasksDashboard total={data.total} {...data.metrics} />
      <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] p-5">
        <ul className="list-none">
          {data.tasks.map((task) => (
            <li
              onClick={() => onTaskClick(task)}
              key={task.id}
              className="py-4 border-b border-dashed border-[#e2e8f0] flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2"
            >
              <div className="flex-1">
                <div className="font-medium text-sm mb-1">{task.title}</div>
                <div className="text-xs text-[#667eea] mb-2">
                  {task.description}
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {task.dueDate && getDueDateStatus(task.dueDate, task.status)}
                  <span
                    className={`px-2 py-0.5 rounded ${
                      task.priority === "HIGH"
                        ? "bg-red-100 text-red-800"
                        : task.priority === "MEDIUM"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              </div>
              <MyTasksActions taskId={task.id} />
            </li>
          ))}
        </ul>
      </div>
      <MyTasksFilters />
      <SubmitWorkModal />
    </div>
  );
}
