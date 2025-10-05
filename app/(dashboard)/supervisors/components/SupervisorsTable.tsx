"use client";
import { Datum as Supervisor } from "@/lib/api/supervisors";
import { useCurrentEditingSupervisorStore } from "../store/useCurrentEditingSupervisorStore";
import { useSupervisorsStore } from "../store/useSupervisorsStore";
import { SupervisorsService } from "@/lib/api";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import { useConfirmationModalStore } from "@/app/(dashboard)/store/useConfirmationStore";
import { env } from "next-runtime-env";
import ThreeDotMenu from "@/app/(dashboard)/tasks/components/ThreeDotMenu";
import { motion } from "framer-motion";

interface SupervisorsTableProps {
  supervisors: Supervisor[];
}

// Utility function to get profile picture URL
const getProfilePictureUrl = (
  profilePicture: string | null | undefined
): string | null => {
  if (!profilePicture) return null;
  const baseUrl = env("NEXT_PUBLIC_API_URL");
  return `${baseUrl}/profile/pictures/${profilePicture}`;
};

export default function SupervisorsTable({
  supervisors,
}: SupervisorsTableProps) {
  const { setSupervisor, setIsEditing, setIsDelegating } =
    useCurrentEditingSupervisorStore();
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

  const handleForceDelete = (supervisor: Supervisor) => {
    openModal({
      title: "Force Delete Supervisor",
      message: `Are you sure you want to force delete supervisor ${supervisor.username}? This will delete them regardless of active assignments and cannot be undone.`,
      onConfirm: () => confirmDelete(supervisor.id),
    });
  };

  const handleDelegate = (supervisor: Supervisor) => {
    setSupervisor(supervisor);
    setIsDelegating(true);
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
      <div className="overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <motion.thead
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gradient-to-r from-slate-50 to-blue-50/30"
          >
            <tr>
              {["Name", "Designation", "Department", "Email", "Actions"].map(
                (header, index) => (
                  <motion.th
                    key={header}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                    scope="col"
                    className={`px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider ${
                      header === "Actions" ? "relative" : ""
                    }`}
                  >
                    {header === "Actions" ? (
                      <span className="sr-only">Actions</span>
                    ) : (
                      header
                    )}
                  </motion.th>
                )
              )}
            </tr>
          </motion.thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {supervisors.map((supervisor, index) => (
              <motion.tr
                key={supervisor.id}
                initial={{ opacity: 0, x: -30, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{
                  duration: 0.5,
                  delay: 0.3 + index * 0.08,
                  ease: "easeOut",
                }}
                className="group transition-all duration-200 hover:bg-slate-50"
              >
                <motion.td
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.08 }}
                  className="px-6 py-4 whitespace-nowrap"
                >
                  <div className="flex items-center">
                    <motion.div
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        duration: 0.5,
                        delay: 0.5 + index * 0.08,
                        ease: "backOut",
                      }}
                      className="flex-shrink-0"
                    >
                      {supervisor.user.profilePicture ? (
                        <motion.img
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            duration: 0.3,
                            delay: 0.6 + index * 0.08,
                          }}
                          src={
                            getProfilePictureUrl(
                              supervisor.user.profilePicture
                            ) || ""
                          }
                          alt={`${supervisor.user.username}'s profile`}
                          className="w-12 h-12 rounded-full object-cover border-2 border-slate-200 shadow-lg"
                          onError={(e) => {
                            // Fallback to initials if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `
                                <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-slate-600 font-medium text-sm shadow-lg">
                                  ${
                                    supervisor.user.name
                                      ? supervisor.user.name
                                          .split(" ")
                                          .map((n) => n[0])
                                          .join("")
                                          .toUpperCase()
                                      : supervisor.user.username
                                          .split(" ")
                                          .map((n) => n[0])
                                          .join("")
                                          .toUpperCase()
                                  }
                                </div>
                              `;
                            }
                          }}
                        />
                      ) : (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            duration: 0.3,
                            delay: 0.6 + index * 0.08,
                          }}
                          className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-slate-600 font-medium text-sm shadow-lg"
                        >
                          {supervisor.user.name
                            ? supervisor.user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                            : supervisor.user.username
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                        </motion.div>
                      )}
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.7 + index * 0.08 }}
                      className="ml-4"
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.3,
                          delay: 0.8 + index * 0.08,
                        }}
                        className="text-sm font-semibold text-slate-900"
                      >
                        {supervisor.user.name || supervisor.user.username}
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.3,
                          delay: 0.9 + index * 0.08,
                        }}
                        className="text-sm text-slate-500"
                      >
                        @{supervisor.user.username}
                      </motion.div>
                    </motion.div>
                  </div>
                </motion.td>
                <motion.td
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.08 }}
                  className="px-6 py-4 whitespace-nowrap text-sm text-slate-900"
                >
                  <motion.span
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 + index * 0.08 }}
                    className="font-medium"
                  >
                    {supervisor.user?.jobTitle || "Not specified"}
                  </motion.span>
                </motion.td>
                <motion.td
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 + index * 0.08 }}
                  className="px-6 py-4 text-sm text-slate-500"
                >
                  {supervisor.departments?.length > 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.7 + index * 0.08 }}
                      className="flex flex-wrap gap-1"
                    >
                      {supervisor.departments
                        .slice(0, 2)
                        .map((dept, deptIndex) => (
                          <motion.span
                            key={dept.id}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{
                              duration: 0.3,
                              delay: 0.8 + index * 0.08 + deptIndex * 0.1,
                              ease: "backOut",
                            }}
                            className="text-xs bg-gradient-to-r from-blue-100 to-indigo-100 text-slate-700 px-3 py-1 rounded-full font-medium shadow-sm"
                          >
                            {dept.name}
                          </motion.span>
                        ))}
                      {supervisor.departments.length > 2 && (
                        <motion.span
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{
                            duration: 0.3,
                            delay: 0.8 + index * 0.08 + 0.2,
                            ease: "backOut",
                          }}
                          className="text-xs bg-gradient-to-r from-slate-100 to-slate-200 text-slate-600 px-3 py-1 rounded-full font-medium shadow-sm"
                        >
                          +{supervisor.departments.length - 2}
                        </motion.span>
                      )}
                    </motion.div>
                  ) : (
                    <motion.span
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.7 + index * 0.08 }}
                      className="text-sm text-slate-400 italic"
                    >
                      None
                    </motion.span>
                  )}
                </motion.td>
                <motion.td
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.7 + index * 0.08 }}
                  className="px-6 py-4 whitespace-nowrap text-sm text-slate-600"
                >
                  <motion.span
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.8 + index * 0.08 }}
                    className="font-medium"
                  >
                    {supervisor.user.email}
                  </motion.span>
                </motion.td>
                <motion.td
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.8 + index * 0.08 }}
                  className="px-6 py-4 text-right text-sm font-medium"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.9 + index * 0.08 }}
                  >
                    <ThreeDotMenu
                      options={[
                        {
                          label: "Edit",
                          onClick: () => handleEdit(supervisor),
                          color: "blue",
                        },
                        {
                          label: "Delegate",
                          onClick: () => handleDelegate(supervisor),
                          color: "green",
                        },
                        {
                          label: "Delete",
                          onClick: () => handleDelete(supervisor),
                          color: "red",
                        },
                        {
                          label: "Force Delete",
                          onClick: () => handleForceDelete(supervisor),
                          color: "red",
                        },
                      ]}
                      className="opacity-0 group-hover:opacity-100 transition-all duration-200"
                    />
                  </motion.div>
                </motion.td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {supervisors.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center py-16"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "backOut" }}
            className="mx-auto w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mb-6 shadow-lg"
          >
            <motion.svg
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="h-10 w-10 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </motion.svg>
          </motion.div>
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-xl font-bold text-slate-900 mb-2"
          >
            No supervisors found
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-slate-500 max-w-md mx-auto"
          >
            Get started by inviting a new supervisor to manage your team.
          </motion.p>
        </motion.div>
      )}
    </>
  );
}
