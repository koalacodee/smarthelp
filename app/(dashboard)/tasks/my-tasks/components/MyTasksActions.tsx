import Pencil from "@/icons/Pencil";
import Trash from "@/icons/Trash";

export default function MyTasksActions({ taskId }: { taskId: string }) {
  return (
    <div className="flex gap-2 mt-2 sm:mt-0">
      <Pencil />
      <Trash />
    </div>
  );
}
