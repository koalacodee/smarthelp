"use client";

import { Department } from "@/lib/api/departments";
import { DepartmentsService } from "@/lib/api";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import { useConfirmationModalStore } from "@/app/(dashboard)/store/useConfirmationStore";
import { useCategoriesStore } from "../store/useCategoriesStore";
import ThreeDotMenu from "@/app/(dashboard)/tasks/components/ThreeDotMenu";

interface SubCategoryActionsProps {
    subCategory: Department;
}

export default function SubCategoryActions({ subCategory }: SubCategoryActionsProps) {
    const { openModal, removeSubCategory } = useCategoriesStore();
    const { openModal: openConfirmation } = useConfirmationModalStore();
    const { addToast } = useToastStore();

    const handleEdit = () => {
        openModal("subCategory", "edit", subCategory);
    };

    const handleDelete = async () => {
        try {
            const canDelete = await DepartmentsService.canDeleteSubDepartment(subCategory.id);

            if (!canDelete) {
                addToast({
                    message: "Cannot delete - has active assignments",
                    type: "error",
                });
                return;
            }

            openConfirmation({
                title: "Delete Sub-category",
                message: `Are you sure you want to delete "${subCategory.name}"?`,
                onConfirm: async () => {
                    try {
                        await DepartmentsService.deleteSubDepartment(subCategory.id);
                        removeSubCategory(subCategory.id);
                        addToast({ message: "Sub-category deleted", type: "success" });
                    } catch {
                        addToast({ message: "Failed to delete", type: "error" });
                    }
                },
            });
        } catch {
            addToast({ message: "Failed to check deletion status", type: "error" });
        }
    };

    const options = [
        { label: "Edit", onClick: handleEdit, color: "blue" as const },
        { label: "Delete", onClick: handleDelete, color: "red" as const },
    ];

    return <ThreeDotMenu options={options} />;
}
