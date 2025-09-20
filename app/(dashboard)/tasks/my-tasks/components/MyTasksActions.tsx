import SquareArrow from "@/icons/SquareArrow";
import SubmitWork from "@/icons/SubmitWork";

interface MyTasksActionsProps {
  onPreviewClick: () => void;
  onTaskClick: () => void;
}

export default function MyTasksActions({
  onPreviewClick,
  onTaskClick,
}: MyTasksActionsProps) {
  return (
    <div className="flex gap-2 mt-2 sm:mt-0">
      <button
        onClick={onPreviewClick}
        className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
        title="Preview Task"
      >
        <SquareArrow className="w-4 h-4" />
      </button>
      <button
        onClick={onTaskClick}
        className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
        title="Submit Work"
      >
        <SubmitWork className="w-4 h-4" />
      </button>
    </div>
  );
}
