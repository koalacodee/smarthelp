import { Department } from "@/lib/api/departments";
import { useCurrentEditingDepartment } from "../store/useCurrentEditingDepartment";
import { useDepartmentsStore } from "../store/useDepartmentsStore";
import PencilIcon from "@/icons/Pencil";
import TrashIcon from "@/icons/Trash";
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
    const canDelete = await DepartmentsService.canDelete(id);
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
        className="p-1 text-slate-600 hover:text-red-600 transition-colors"
        title="Delete department"
        onClick={() => handleDelete(department.id)}
      >
        <TrashIcon className="w-4 h-4" />
      </button>
    </>
  );
}
