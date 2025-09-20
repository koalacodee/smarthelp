import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Metadata } from "next";
import AddTaskButton from "./components/AddTaskButton";
import AddTaskModal from "./components/AddTaskModal";
import SubmitWorkModal from "./components/SubmitWorkModal";
import TasksPage from "./components/TasksPage";

export const metadata: Metadata = {
  title: "Tasks | Task Management System",
  description: "Manage and track team tasks, assignments, and project progress",
};

type UserRole = "EMPLOYEE" | "ADMIN" | "SUPERVISOR";

export default async function Page() {
  const cookieStore = await cookies();
  const userRole = cookieStore.get("user-role")?.value as UserRole | undefined;

  if (userRole === "EMPLOYEE") {
    return redirect("/tasks/my-tasks");
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">Team Tasks</h2>
          <AddTaskButton />
        </div>

        <TasksPage />

        <AddTaskModal role={userRole === "ADMIN" ? "admin" : "supervisor"} />
        <SubmitWorkModal />
      </div>
    </>
  );
}
