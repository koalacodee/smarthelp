import React from "react";
import { Department } from "@/lib/api/departments";
import { useEditSubDepartmentStore } from "@/app/(dashboard)/store/useEditSubDepartmentStore";
import { useConfirmationModalStore } from "@/app/(dashboard)/store/useConfirmationStore";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import { DepartmentsService } from "@/lib/api";
import { useSubDepartmentsStore } from "@/app/(dashboard)/store/useSubDepartmentsStore";
import ThreeDotMenu from "@/app/(dashboard)/tasks/components/ThreeDotMenu";

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

  const options = [
    { label: "Edit", onClick: handleEdit, color: "blue" as const },
    { label: "Delete", onClick: handleDelete, color: "red" as const },
  ];

  return <ThreeDotMenu options={options} />;
}
