import React from "react";
import { Entity } from "@/lib/api/employees";
import { useEditEmployeeStore } from "@/app/(dashboard)/store/useEditEmployeeStore";
import { useConfirmationModalStore } from "@/app/(dashboard)/store/useConfirmationStore";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import { EmployeeService } from "@/lib/api";
import PencilIcon from "@/icons/Pencil";
import TrashIcon from "@/icons/Trash";
import { useEmployeesStore } from "@/app/(dashboard)/store/useEmployeesStore";
import { EmployeeResponse } from "@/lib/api/v2/services/employee";
import ThreeDotMenu from "@/app/(dashboard)/tasks/components/ThreeDotMenu";

interface EmployeeActionsProps {
  employee: EmployeeResponse;
}

export default function EmployeeActions({ employee }: EmployeeActionsProps) {
  const { openModal: openEditModal } = useEditEmployeeStore();
  const { openModal: openConfirmationModal } = useConfirmationModalStore();
  const { addToast } = useToastStore();
  const { deleteEmployee } = useEmployeesStore();

  const handleEdit = () => {
    openEditModal(employee);
  };

  const handleDelete = async () => {
    try {
      const canDelete = await EmployeeService.canDeleteEmployee(employee.id);

      if (canDelete) {
        openConfirmationModal({
          title: "Delete Employee",
          message: `Are you sure you want to delete ${employee.user.name}? This action cannot be undone.`,
          onConfirm: async () => {
            try {
              await EmployeeService.deleteEmployee(employee.id);
              addToast({
                message: `${employee.user.name} has been successfully deleted`,
                type: "success",
              });
              deleteEmployee(employee.id);
            } catch (error) {
              addToast({
                message: `Failed to delete ${employee.user.name}`,
                type: "error",
              });
            }
          },
        });
      } else {
        addToast({
          message: `${employee.user.name} cannot be deleted because they have active assignments or records associated with them.`,
          type: "error",
        });
      }
    } catch (error) {
      addToast({
        message: "Failed to check if employee can be deleted",
        type: "error",
      });
    }
  };

  return (
    <ThreeDotMenu
      options={[
        {
          label: "Edit",
          onClick: handleEdit,
          color: "blue",
        },
        {
          label: "Delete",
          onClick: handleDelete,
          color: "red",
        },
      ]}
      className="opacity-0 group-hover:opacity-100 transition-all duration-200"
    />
  );
}
