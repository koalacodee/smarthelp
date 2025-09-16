import { TasksService } from "@/lib/api";
import MyTasks from "./components/MyTasks";

export default async function Page() {
  const data = await TasksService.getMyTasks();

  return <MyTasks data={data} />;
}

export const revalidate = 1;
