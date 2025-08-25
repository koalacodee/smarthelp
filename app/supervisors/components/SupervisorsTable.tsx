"use client";
import { Datum as Supervisor } from "@/lib/api/supervisors";
import { useCurrentEditingSupervisorStore } from "../store/useCurrentEditingSupervisorStore";
import { useSupervisorsStore } from "../store/useSupervisorsStore";
import { SupervisorsService } from "@/lib/api";
import { useToastStore } from "@/app/store/useToastStore";
import { useConfirmationModalStore } from "@/app/store/useConfirmationStore";

interface SupervisorsTableProps {
  supervisors: Supervisor[];
}

export default function SupervisorsTable({
  supervisors,
}: SupervisorsTableProps) {
  const { setSupervisor, setIsEditing } = useCurrentEditingSupervisorStore();
  const { removeSupervisor } = useSupervisorsStore();
  const { addToast } = useToastStore();
  const { openModal } = useConfirmationModalStore();

  const handleEdit = (supervisor: Supervisor) => {
    setSupervisor(supervisor);
    setIsEditing(true);
  };

  const handleDelete = async (supervisor: Supervisor) => {
    try {
      const canDelete = await SupervisorsService.canDelete(supervisor.id);
      if (!canDelete) {
        addToast({
          message: "Cannot delete supervisor with active assignments",
          type: "error",
        });
        return;
      }
      openModal({
        title: "Delete Supervisor",
        message: `Are you sure you want to delete supervisor ${supervisor.username}? This action cannot be undone.`,
        onConfirm: () => confirmDelete(supervisor.id),
      });
    } catch (error) {
      addToast({
        message: "Failed to check delete permissions",
        type: "error",
      });
    }
  };

  const confirmDelete = async (supervisorId: string) => {
    try {
      await SupervisorsService.delete(supervisorId);
      removeSupervisor(supervisorId);
      addToast({
        message: "Supervisor deleted successfully",
        type: "success",
      });
    } catch (error: any) {
      addToast({
        message:
          error?.response?.data?.message || "Failed to delete supervisor",
        type: "error",
      });
    }
  };

  return (
    <>
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-100">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                Username
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                Employee ID
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                Permissions
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                Assigned Categories
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {supervisors.map((supervisor) => (
              <tr
                key={supervisor.id}
                className="hover:bg-slate-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                  {supervisor.user.username}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {supervisor.user.employeeId}
                </td>
                <td className="px-6 py-4 max-w-sm">
                  {supervisor.permissions?.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {supervisor.permissions.map((permission: string) => (
                        <span
                          key={permission}
                          className="text-xs font-semibold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full"
                        >
                          {permission.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-slate-400 italic">None</span>
                  )}
                </td>
                <td className="px-6 py-4 max-w-sm">
                  {supervisor.departments?.length > 0 ? (
                    <p
                      className="text-sm text-slate-500 truncate"
                      title={supervisor.departments
                        .map(({ name }) => name)
                        .join(", ")}
                    >
                      {supervisor.departments
                        .map(({ name }) => name)
                        .join(", ")}
                    </p>
                  ) : (
                    <span className="text-sm text-slate-400 italic">None</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                  <button
                    onClick={() => handleEdit(supervisor)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(supervisor)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
