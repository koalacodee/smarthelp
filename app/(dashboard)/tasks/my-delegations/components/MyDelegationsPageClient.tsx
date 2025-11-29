"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import DelegationCard from "./DelegationCard";
import MyDelegationsDashboard from "./MyDelegationsDashboard";
import MyDelegationsFilters from "./MyDelegationsFilters";
import { useMyDelegationsStore } from "../store/useMyDelegationsStore";
import {
  TaskDelegationDTO,
  TaskDelegationSubmissionDTO,
} from "@/lib/api/v2/services/delegations";
import { useAttachmentsStore } from "@/lib/store/useAttachmentsStore";
import { useMediaMetadataStore } from "@/lib/store/useMediaMetadataStore";
import { FileService } from "@/lib/api";
import { FileHubAttachment } from "@/lib/api/v2/services/shared/filehub";
import { useAttachments } from "@/hooks/useAttachments";

interface MyDelegationsPageClientProps {
  initialDelegations: TaskDelegationDTO[];
  initialSubmissions: { [delegationId: string]: TaskDelegationSubmissionDTO[] };
  initialAttachments: { [delegationId: string]: string[] };
  initialDelegationSubmissionAttachments: { [submissionId: string]: string[] };
  initialTotal: number;
  initialFileHubAttachments: FileHubAttachment[];
}

export default function MyDelegationsPageClient({
  initialDelegations,
  initialSubmissions,
  initialAttachments,
  initialDelegationSubmissionAttachments,
  initialTotal,
  initialFileHubAttachments,
}: MyDelegationsPageClientProps) {
  const {
    delegations,
    filteredDelegations,
    filters,
    setDelegations,
    setFilters,
    isLoading,
    error,
  } = useMyDelegationsStore();
  const { setAttachments } = useAttachmentsStore();
  const { setMetadata } = useMediaMetadataStore();
  const { addExistingAttachmentToTarget, clearExistingAttachmentsForTarget } =
    useAttachments();

  useEffect(() => {
    if (initialFileHubAttachments) {
      const allTargetIds = new Set<string>();

      initialFileHubAttachments?.forEach((attachment) => {
        if (attachment.targetId) {
          allTargetIds.add(attachment.targetId);
        }
      });

      allTargetIds.forEach((targetId) => {
        clearExistingAttachmentsForTarget(targetId);
      });
      initialFileHubAttachments.forEach((attachment) => {
        if (attachment.targetId) {
          addExistingAttachmentToTarget(attachment.targetId, {
            id: attachment.id,
            fileType: attachment.type,
            filename: attachment.filename,
            originalName: attachment.originalName,
            expirationDate: attachment.expirationDate,
            createdAt: attachment.createdAt,
            targetId: attachment.targetId,
            userId: attachment.userId,
            isGlobal: attachment.isGlobal,
            size: attachment.size,
            signedUrl: attachment.signedUrl,
          });
        }
      });
    }
  }, [initialFileHubAttachments]);

  useEffect(() => {
    // Initialize with server data only once on mount
    setDelegations(initialDelegations, initialTotal);

    // Store attachments
    if (initialAttachments) {
      setAttachments("delegation", initialAttachments);

      // Prefill metadata cache
      const allIds: string[] = Object.values(initialAttachments)
        .flat()
        .filter(Boolean) as string[];
      if (allIds.length > 0) {
        Promise.all(
          allIds.map((id) =>
            FileService.getAttachmentMetadata(id)
              .then((m) => setMetadata(id, m))
              .catch(() => null)
          )
        );
      }
    }
  }, []); // Empty dependency array - only run once on mount

  // Calculate metrics
  const completedCount = delegations.filter(
    (d) => d.status === "COMPLETED"
  ).length;
  const pendingCount = delegations.filter(
    (d) => d.status === "TODO" || d.status === "PENDING_REVIEW"
  ).length;
  const completionPercentage =
    delegations.length === 0
      ? 0
      : Math.round((completedCount / delegations.length) * 100);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  return (
    <>
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : error ? (
        <div className="text-center py-8 text-destructive">{error}</div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6"
        >
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header Section */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="bg-gradient-to-r from-slate-50 to-purple-50/50 px-6 py-4 rounded-2xl shadow-xl border border-white/20"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <motion.div
                    initial={{ rotate: -90, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.1, ease: "backOut" }}
                    className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center"
                  >
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </motion.div>
                  <div>
                    <motion.h2
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                      className="text-lg font-semibold text-slate-800"
                    >
                      My Delegations
                    </motion.h2>
                    <motion.p
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                      className="text-sm text-slate-600"
                    >
                      {filteredDelegations.length} delegation
                      {filteredDelegations.length !== 1 ? "s" : ""} available
                    </motion.p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-[1fr_3fr] gap-8"
            >
              {/* Left Column - Dashboard and Filters */}
              <div className="space-y-6">
                {/* Dashboard */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  whileHover={{
                    y: -2,
                    transition: { duration: 0.2 },
                  }}
                  className="bg-white/90  rounded-2xl shadow-xl border border-white/20 p-6"
                >
                  <MyDelegationsDashboard
                    total={delegations.length}
                    completedCount={completedCount}
                    pendingCount={pendingCount}
                    completionPercentage={completionPercentage}
                  />
                </motion.div>

                {/* Filters */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  whileHover={{
                    y: -2,
                    transition: { duration: 0.2 },
                  }}
                  className="bg-white/90  rounded-2xl shadow-xl border border-white/20 p-6"
                >
                  <MyDelegationsFilters onFilterChange={handleFilterChange} />
                </motion.div>
              </div>

              {/* Right Column - Delegations List */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                whileHover={{
                  y: -2,
                  transition: { duration: 0.2 },
                }}
                className="bg-white/90  rounded-2xl shadow-xl border border-white/20 p-6"
              >
                {filteredDelegations.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.8 }}
                    className="px-6 py-16 text-center"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.9 }}
                      className="flex flex-col items-center justify-center space-y-4"
                    >
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                          duration: 0.5,
                          delay: 1,
                          ease: "backOut",
                        }}
                        className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center"
                      >
                        <svg
                          className="w-8 h-8 text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 1.1 }}
                        className="text-slate-500"
                      >
                        <p className="text-lg font-medium mb-2">
                          No delegations found
                        </p>
                        <p className="text-sm">
                          Try adjusting your search or filter criteria
                        </p>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    {filteredDelegations.map((delegation, index) => (
                      <motion.div
                        key={delegation.id.toString()}
                        initial={{ opacity: 0, y: 20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{
                          duration: 0.3,
                          delay: 0.8 + index * 0.05,
                          ease: "easeOut",
                        }}
                        whileHover={{
                          y: -2,
                          transition: { duration: 0.2 },
                        }}
                      >
                        <DelegationCard
                          delegation={delegation}
                          submissions={
                            initialSubmissions[delegation.id.toString()] || []
                          }
                          delegationSubmissionAttachments={
                            initialDelegationSubmissionAttachments
                          }
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </>
  );
}
