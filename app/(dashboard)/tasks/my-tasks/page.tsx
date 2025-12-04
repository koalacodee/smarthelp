import { TasksService } from "@/lib/api";
import { TaskDelegationService } from "@/lib/api/v2";
import MyTasks from "./components/MyTasks";
import { cookies } from "next/headers";
import { env } from "next-runtime-env";
import TasksPageWrapper from "./components/TasksPageWrapper";

export default async function Page() {
  const response = await TasksService.getMyTasks();

  console.log(response);

  // Fetch user to check role
  const cookieStore = await cookies();
  const user = await fetch(`${env("NEXT_PUBLIC_BASE_URL")}/server/me`, {
    headers: { Cookie: cookieStore.toString() },
  }).then((res) => res.json());

  // Fetch delegations if user is a supervisor
  let delegationsData = null;
  if (user.user.role === "SUPERVISOR") {
    delegationsData = await TaskDelegationService.getMyDelegations({});
  }

  // Pass the new response structure directly
  // Note: attachments are available in response.attachments if needed
  return (
    <TasksPageWrapper
      tasksData={response}
      delegationsData={delegationsData}
      userRole={user.user.role}
    />
  );
}

export const revalidate = 1;
