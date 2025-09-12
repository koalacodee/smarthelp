import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import SupervisorPage from "./components/SupervisorPage";
import AdminPage from "./components/AdminPage";

type UserRole = "EMPLOYEE" | "ADMIN" | "SUPERVISOR";

export default async function Page() {
  const cookieStore = await cookies();
  const userRole = cookieStore.get("user-role")?.value as UserRole | undefined;

  if (userRole === "EMPLOYEE") {
    return redirect("/tasks/my-tasks");
  }

  return <>{userRole === "SUPERVISOR" ? <SupervisorPage /> : <AdminPage />}</>;
}
