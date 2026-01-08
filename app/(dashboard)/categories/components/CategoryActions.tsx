"use client";

import { Department } from "@/lib/api/departments";
import { DepartmentsService } from "@/lib/api";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import { useConfirmationModalStore } from "@/app/(dashboard)/store/useConfirmationStore";
import { useCategoriesStore } from "../store/useCategoriesStore";
import ThreeDotMenu from "@/app/(dashboard)/tasks/components/ThreeDotMenu";
import { env } from "next-runtime-env";

interface CategoryActionsProps {
    category: Department;
}

export default function CategoryActions({ category }: CategoryActionsProps) {
    const { openModal, removeCategory } = useCategoriesStore();
    const { openModal: openConfirmation } = useConfirmationModalStore();
    const { addToast } = useToastStore();

    const handleEdit = () => {
        openModal("category", "edit", category);
    };

    const handleShare = async () => {
        try {
            const key = await DepartmentsService.shareDepartment(category.id);
            const shareUrl = `${env("NEXT_PUBLIC_CLIENT_URL")}/share?key=${key}`;
            await navigator.clipboard.writeText(shareUrl);
            addToast({ message: "Share link copied!", type: "success" });
        } catch {
            addToast({ message: "Failed to generate share link", type: "error" });
        }
    };

    const handleDelete = async () => {
        const canDelete = await DepartmentsService.canDeleteMainDepartment(category.id);

        if (!canDelete) {
            addToast({ message: "Cannot delete this category", type: "error" });
            return;
        }

        openConfirmation({
            title: "Delete Category",
            message: `Are you sure you want to delete "${category.name}"?`,
            onConfirm: async () => {
                try {
                    await DepartmentsService.deleteMainDepartment(category.id);
                    removeCategory(category.id);
                    addToast({ message: "Category deleted", type: "success" });
                } catch {
                    addToast({ message: "Failed to delete category", type: "error" });
                }
            },
        });
    };

    const options = [
        { label: "Edit", onClick: handleEdit, color: "blue" as const },
        { label: "Share", onClick: handleShare, color: "green" as const },
        { label: "Delete", onClick: handleDelete, color: "red" as const },
    ];

    return <ThreeDotMenu options={options} />;
}
