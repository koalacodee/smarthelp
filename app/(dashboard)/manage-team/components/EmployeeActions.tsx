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
import { useLocaleStore } from "@/lib/store/useLocaleStore";

interface EmployeeActionsProps {
  employee: EmployeeResponse;
}

export default function EmployeeActions({ employee }: EmployeeActionsProps) {
  const { openModal: openEditModal } = useEditEmployeeStore();
  const { openModal: openConfirmationModal } = useConfirmationModalStore();
  const { addToast } = useToastStore();
  const { deleteEmployee } = useEmployeesStore();
  const { locale } = useLocaleStore();

  const handleEdit = () => {
    openEditModal(employee);
  };

  const handleDelete = async () => {
    try {
      const canDelete = await EmployeeService.canDeleteEmployee(employee.id);

      if (canDelete) {
        openConfirmationModal({
          title:
            locale?.manageTeam?.confirmations?.deleteTitle || "Delete Employee",
          message:
            locale?.manageTeam?.confirmations?.deleteMessage?.replace(
              "{name}",
              employee.user.name
            ) || "Are you sure you want to delete this employee?",
          confirmText:
            locale?.manageTeam?.confirmations?.confirmText || "Confirm",
          onConfirm: async () => {
            try {
              await EmployeeService.deleteEmployee(employee.id);
              addToast({
                message:
                  locale?.manageTeam?.toasts?.employeeDeleted.replace(
                    "{name}",
                    employee.user.name
                  ) || "Employee deleted",
                type: "success",
              });
              deleteEmployee(employee.id);
            } catch (error) {
              addToast({
                message:
                  locale?.manageTeam?.toasts?.deleteFailed.replace(
                    "{name}",
                    employee.user.name
                  ) || "Delete failed",
                type: "error",
              });
            }
          },
        });
      } else {
        addToast({
          message:
            locale?.manageTeam?.toasts?.cannotDelete.replace(
              "{name}",
              employee.user.name
            ) || "Cannot delete employee",
          type: "error",
        });
      }
    } catch (error) {
      addToast({
        message:
          locale?.manageTeam?.toasts?.checkDeleteFailed ||
          "Check delete failed",
        type: "error",
      });
    }
  };

  if (!locale) return null;

  return (
    <ThreeDotMenu
      options={[
        {
          label: locale.manageTeam.actions.edit,
          onClick: handleEdit,
          color: "blue",
        },
        {
          label: locale.manageTeam.actions.delete,
          onClick: handleDelete,
          color: "red",
        },
      ]}
      className="opacity-0 group-hover:opacity-100 transition-all duration-200"
    />
  );
}
