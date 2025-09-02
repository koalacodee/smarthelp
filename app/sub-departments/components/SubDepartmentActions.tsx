import React from "react";
import { Department } from "@/lib/api/departments";
import { useEditSubDepartmentStore } from "@/app/store/useEditSubDepartmentStore";
import { useConfirmationModalStore } from "@/app/store/useConfirmationStore";
import { useToastStore } from "@/app/store/useToastStore";
import { DepartmentsService } from "@/lib/api";
import { useSubDepartmentsStore } from "@/app/store/useSubDepartmentsStore";
import PencilIcon from "@/icons/Pencil";
import TrashIcon from "@/icons/Trash";

interface SubDepartmentActionsProps {
  subDepartment: Department;
}

export default function SubDepartmentActions({
  subDepartment,
}: SubDepartmentActionsProps) {
  const { openModal: openEditModal } = useEditSubDepartmentStore();
  const { openModal: openConfirmationModal } = useConfirmationModalStore();
  const { addToast } = useToastStore();
  const { deleteSubDepartment } = useSubDepartmentsStore();

  const handleEdit = () => {
    openEditModal(subDepartment);
  };

  const handleDelete = async () => {
    try {
      const canDelete = await DepartmentsService.canDeleteSubDepartment(
        subDepartment.id
      );

      if (canDelete) {
        openConfirmationModal({
          title: "Delete Sub-department",
          message: `Are you sure you want to delete ${subDepartment.name}? This action cannot be undone.`,
          onConfirm: async () => {
            try {
              await DepartmentsService.deleteSubDepartment(subDepartment.id);
              deleteSubDepartment(subDepartment.id);
              addToast({
                message: `${subDepartment.name} has been successfully deleted`,
                type: "success",
              });
            } catch (error) {
              addToast({
                message: `Failed to delete ${subDepartment.name}`,
                type: "error",
              });
            }
          },
        });
      } else {
        addToast({
          message: `${subDepartment.name} cannot be deleted because it has active assignments or records associated with it.`,
          type: "error",
        });
      }
    } catch (error) {
      addToast({
        message: "Failed to check if sub-department can be deleted",
        type: "error",
      });
    }
  };

  return (
    <div className="flex items-center space-x-3">
      <button
        onClick={handleEdit}
        className="text-blue-600 hover:text-blue-900 text-sm font-medium inline-flex items-center"
      >
        <PencilIcon className="w-4 h-4 mr-1" />
        Edit
      </button>
      <button
        onClick={handleDelete}
        className="text-red-600 hover:text-red-900 text-sm font-medium inline-flex items-center"
      >
        <TrashIcon className="w-4 h-4 mr-1" />
        Delete
      </button>
    </div>
  );
}
