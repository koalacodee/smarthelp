"use client";

import { Department } from "@/lib/api/departments";
import { DepartmentsService } from "@/lib/api";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import { useConfirmationModalStore } from "@/app/(dashboard)/store/useConfirmationStore";
import { useCategoriesStore } from "../store/useCategoriesStore";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import ThreeDotMenu from "@/app/(dashboard)/tasks/components/ThreeDotMenu";

interface SubCategoryActionsProps {
  subCategory: Department;
}

export default function SubCategoryActions({
  subCategory,
}: SubCategoryActionsProps) {
  const { openModal, removeSubCategory } = useCategoriesStore();
  const { openModal: openConfirmation } = useConfirmationModalStore();
  const { addToast } = useToastStore();
  const { locale } = useLocaleStore();

  const handleEdit = () => {
    openModal("subCategory", "edit", subCategory);
  };

  const handleDelete = async () => {
    try {
      const canDelete = await DepartmentsService.canDeleteSubDepartment(
        subCategory.id
      );

      if (!canDelete) {
        addToast({
          message:
            locale?.categories?.toasts?.cannotDeleteSubCategory ||
            "Cannot delete subcategory",
          type: "error",
        });
        return;
      }

      openConfirmation({
        title:
          locale?.categories?.confirmations?.deleteSubCategoryTitle ||
          "Delete Subcategory",
        message: (
          locale?.categories?.confirmations?.deleteSubCategoryMessage ||
          "Are you sure you want to delete this subcategory?"
        ).replace("{name}", subCategory.name),
        onConfirm: async () => {
          try {
            await DepartmentsService.deleteSubDepartment(subCategory.id);
            removeSubCategory(subCategory.id);
            addToast({
              message:
                locale?.categories?.toasts?.subCategoryDeleted ||
                "Subcategory deleted",
              type: "success",
            });
          } catch {
            addToast({
              message:
                locale?.categories?.toasts?.deleteError || "Delete error",
              type: "error",
            });
          }
        },
      });
    } catch {
      addToast({
        message:
          locale?.categories?.toasts?.checkDeleteError || "Check delete error",
        type: "error",
      });
    }
  };

  if (!locale) return null;

  const options = [
    {
      label: locale.categories.actions.edit,
      onClick: handleEdit,
      color: "blue" as const,
    },
    {
      label: locale.categories.actions.delete,
      onClick: handleDelete,
      color: "red" as const,
    },
  ];

  return <ThreeDotMenu options={options} />;
}
