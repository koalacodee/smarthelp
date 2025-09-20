import { TasksService } from "@/lib/api";
import MyTasks from "./components/MyTasks";

export default async function Page() {
  const response = await TasksService.getMyTasks();
  console.log(response);

  // Pass the new response structure directly
  // Note: attachments are available in response.attachments if needed
  return <MyTasks data={response} />;
}

export const revalidate = 1;
