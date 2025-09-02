import { Department } from "@/lib/api/departments";
import { useCurrentEditingDepartment } from "../store/useCurrentEditingDepartment";
import { useDepartmentsStore } from "../store/useDepartmentsStore";
import PencilIcon from "@/icons/Pencil";
import TrashIcon from "@/icons/Trash";
import LinkIcon from "@/icons/Link";
import { DepartmentsService } from "@/lib/api";
import { useToastStore } from "@/app/store/useToastStore";
import { useConfirmationModalStore } from "@/app/store/useConfirmationStore";

export default function DepartmentActions({
  department,
}: {
  department: Department;
}) {
  const { openModal: openEditing } = useCurrentEditingDepartment();
  const { openModal } = useConfirmationModalStore();
  const { deleteDepartment } = useDepartmentsStore();
  const { addToast } = useToastStore();
  const handleDelete = async (id: string) => {
    const canDelete = await DepartmentsService.canDeleteMainDepartment(id);
    if (canDelete) {
      openModal({
        title: "Delete Department",
        message: "Are you sure you want to delete this department?",
        onConfirm: () => {
          DepartmentsService.deleteMainDepartment(id);
          deleteDepartment(id);
          addToast({
            message: "Department Deleted Successfully!",
            type: "success",
          });
        },
      });
    } else {
      addToast({
        message: "Cannot Delete this department",
        type: "error",
      });
    }
  };

  const handleShare = async (id: string) => {
    try {
      const key = await DepartmentsService.shareDepartment(id);
      const shareUrl = `${process.env.NEXT_PUBLIC_CLIENT_URL}/share?key=${key}`;
      await navigator.clipboard.writeText(shareUrl);
      addToast({
        message: "Share link copied to clipboard!",
        type: "success",
      });
    } catch (error) {
      addToast({
        message: "Failed to generate share link",
        type: "error",
      });
    }
  };

  return (
    <>
      <button
        className="p-1 text-slate-600 hover:text-blue-600 transition-colors"
        title="Edit department"
        onClick={() => openEditing("edit", department)}
      >
        <PencilIcon className="w-4 h-4" />
      </button>
      <button
        className="p-1 text-slate-600 hover:text-green-600 transition-colors"
        title="Share department"
        onClick={() => handleShare(department.id)}
      >
        <LinkIcon className="w-4 h-4" />
      </button>
      <button
        className="p-1 text-slate-600 hover:text-red-600 transition-colors"
        title="Delete department"
        onClick={() => handleDelete(department.id)}
      >
        <TrashIcon className="w-4 h-4" />
      </button>
    </>
  );
}
