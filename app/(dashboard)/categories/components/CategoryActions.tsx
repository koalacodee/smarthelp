"use client";

import { Department } from "@/lib/api/departments";
import { DepartmentsService } from "@/lib/api";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import { useConfirmationModalStore } from "@/app/(dashboard)/store/useConfirmationStore";
import { useCategoriesStore } from "../store/useCategoriesStore";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import ThreeDotMenu from "@/app/(dashboard)/tasks/components/ThreeDotMenu";
import { env } from "next-runtime-env";

interface CategoryActionsProps {
  category: Department;
}

export default function CategoryActions({ category }: CategoryActionsProps) {
  const { openModal, removeCategory } = useCategoriesStore();
  const { openModal: openConfirmation } = useConfirmationModalStore();
  const { addToast } = useToastStore();
  const { locale } = useLocaleStore();

  const handleEdit = () => {
    openModal("category", "edit", category);
  };

  const handleShare = async () => {
    try {
      const key = await DepartmentsService.shareDepartment(category.id);
      const shareUrl = `${env("NEXT_PUBLIC_CLIENT_URL")}/share?key=${key}`;
      await navigator.clipboard.writeText(shareUrl);
      addToast({
        message:
          locale?.categories?.toasts?.shareLinkCopied || "Share link copied",
        type: "success",
      });
    } catch {
      addToast({
        message: locale?.categories?.toasts?.shareError || "Share error",
        type: "error",
      });
    }
  };

  const handleDelete = async () => {
    const canDelete = await DepartmentsService.canDeleteMainDepartment(
      category.id
    );

    if (!canDelete) {
      addToast({
        message:
          locale?.categories?.toasts?.cannotDeleteCategory ||
          "Cannot delete category",
        type: "error",
      });
      return;
    }

    openConfirmation({
      title:
        locale?.categories?.confirmations?.deleteCategoryTitle ||
        "Delete Category",
      message: (
        locale?.categories?.confirmations?.deleteCategoryMessage ||
        "Are you sure you want to delete this category?"
      ).replace("{name}", category.name),
      onConfirm: async () => {
        try {
          await DepartmentsService.deleteMainDepartment(category.id);
          removeCategory(category.id);
          addToast({
            message:
              locale?.categories?.toasts?.categoryDeleted || "Category deleted",
            type: "success",
          });
        } catch {
          addToast({
            message: locale?.categories?.toasts?.deleteError || "Delete error",
            type: "error",
          });
        }
      },
    });
  };

  if (!locale) return null;

  const options = [
    {
      label: locale.categories.actions.edit,
      onClick: handleEdit,
      color: "blue" as const,
    },
    {
      label: locale.categories.actions.share,
      onClick: handleShare,
      color: "green" as const,
    },
    {
      label: locale.categories.actions.delete,
      onClick: handleDelete,
      color: "red" as const,
    },
  ];

  return <ThreeDotMenu options={options} />;
}
