import { Department } from "@/lib/api/departments";
import { useCurrentEditingDepartment } from "../store/useCurrentEditingDepartment";
import { useDepartmentsStore } from "../store/useDepartmentsStore";
import { DepartmentsService } from "@/lib/api";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import { useConfirmationModalStore } from "@/app/(dashboard)/store/useConfirmationStore";
import { env } from "next-runtime-env";
import ThreeDotMenu from "@/app/(dashboard)/tasks/components/ThreeDotMenu";

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
    const canDelete = await DepartmentsService.canDeleteMainDepartment(id);
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
      addToast({ message: "Cannot Delete this department", type: "error" });
    }
  };

  const handleShare = async (id: string) => {
    try {
      const key = await DepartmentsService.shareDepartment(id);
      const shareUrl = `${env("NEXT_PUBLIC_CLIENT_URL")}/share?key=${key}`;
      await navigator.clipboard.writeText(shareUrl);
      addToast({ message: "Share link copied to clipboard!", type: "success" });
    } catch (error) {
      addToast({ message: "Failed to generate share link", type: "error" });
    }
  };

  const options = [
    {
      label: "Edit",
      onClick: () => openEditing("edit", department),
      color: "blue" as const,
    },
    {
      label: "Share",
      onClick: () => handleShare(department.id),
      color: "green" as const,
    },
    {
      label: "Delete",
      onClick: () => handleDelete(department.id),
      color: "red" as const,
    },
  ];

  return <ThreeDotMenu options={options} />;
}
