import React from "react";
import { Entity } from "@/lib/api/employees";
import { useEditEmployeeStore } from "@/app/(dashboard)/store/useEditEmployeeStore";
import { useConfirmationModalStore } from "@/app/(dashboard)/store/useConfirmationStore";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import { EmployeeService } from "@/lib/api";
import PencilIcon from "@/icons/Pencil";
import TrashIcon from "@/icons/Trash";
import { useEmployeesStore } from "@/app/(dashboard)/store/useEmployeesStore";

interface EmployeeActionsProps {
  employee: Entity;
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
