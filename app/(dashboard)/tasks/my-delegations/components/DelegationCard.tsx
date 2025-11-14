"use client";

import { useState, useEffect, useMemo } from "react";
import { TaskDelegationDTO, TaskDelegationSubmissionDTO } from "@/lib/api/v2/services/delegations";
import Eye from "@/icons/Eye";
import Clock from "@/icons/Clock";
import { useAttachmentsStore } from "@/lib/store/useAttachmentsStore";
import { useMediaMetadataStore } from "@/lib/store/useMediaMetadataStore";
import { useMediaPreviewStore } from "@/app/(dashboard)/store/useMediaPreviewStore";
import { FileService } from "@/lib/api";
import ThreeDotMenu from "../../components/ThreeDotMenu";
import { TaskDelegationService } from "@/lib/api/v2";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import { useMyDelegationsStore } from "../store/useMyDelegationsStore";

// Custom PaperClip icon component
const PaperClipIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
    />
  </svg>
);

// Delegation icon component
const DelegationIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
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
);

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "HIGH":
      return "bg-red-500";
    case "MEDIUM":
      return "bg-yellow-500";
    case "LOW":
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "PENDING_REVIEW":
      return "bg-blue-100 text-blue-800";
    case "COMPLETED":
      return "bg-green-100 text-green-800";
    case "TODO":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getSubmissionStatusColor = (status: string) => {
  switch (status) {
    case "SUBMITTED":
      return "bg-blue-100 text-blue-800";
    case "APPROVED":
      return "bg-green-100 text-green-800";
    case "REJECTED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

interface DelegationCardProps {
  delegation: TaskDelegationDTO;
  submissions: TaskDelegationSubmissionDTO[];
  delegationSubmissionAttachments: { [submissionId: string]: string[] };
}

export default function DelegationCard({
  delegation,
  submissions,
  delegationSubmissionAttachments,
}: DelegationCardProps) {
  const [isSubmissionsExpanded, setIsSubmissionsExpanded] = useState(false);
  const { getAttachments } = useAttachmentsStore();
  const delegationAttachmentIds = getAttachments("delegation", delegation.id.toString());
  const { setMetadata } = useMediaMetadataStore();
  const { openPreview } = useMediaPreviewStore();
  const { addToast } = useToastStore();
  const { updateDelegation } = useMyDelegationsStore();
  const [delegationAttachmentsMetadata, setDelegationAttachmentsMetadata] =
    useState<{
      [attachmentId: string]: any;
    }>({});
  const [submissionAttachmentsMetadata, setSubmissionAttachmentsMetadata] =
    useState<{
      [attachmentId: string]: any;
    }>({});

  // Get the latest submission (the one with the biggest submittedAt)
  const latestSubmission = useMemo(() => {
    if (submissions.length === 0) return null;
    return submissions.reduce((latest, current) => {
      const latestDate = new Date(latest.submittedAt).getTime();
      const currentDate = new Date(current.submittedAt).getTime();
      return currentDate > latestDate ? current : latest;
    });
  }, [submissions]);

  // Load attachment metadata for this delegation
  useEffect(() => {
    const loadAttachmentsMetadata = async () => {
      if (delegationAttachmentIds.length > 0) {
        const attachmentMetadataPromises = delegationAttachmentIds.map(
          async (attachmentId) => {
            try {
              const metadata = await FileService.getAttachmentMetadata(
                attachmentId
              );
              setMetadata(attachmentId, metadata);
              return { attachmentId, metadata };
            } catch (error) {
              return { attachmentId, metadata: null };
            }
          }
        );

        const results = await Promise.all(attachmentMetadataPromises);
        const attachmentMap = results.reduce(
          (acc, { attachmentId, metadata }) => {
            if (metadata) {
              acc[attachmentId] = metadata;
            }
            return acc;
          },
          {} as { [attachmentId: string]: any }
        );

        setDelegationAttachmentsMetadata(attachmentMap);
      }
    };

    loadAttachmentsMetadata();
  }, [delegation.id, setMetadata, delegationAttachmentIds.length]);

  // Load submission attachment metadata
  useEffect(() => {
    const loadSubmissionAttachmentsMetadata = async () => {
      const allSubmissionAttachments: string[] = [];

      submissions.forEach((submission) => {
        const submissionId = submission.id.toString();
        const attachments = delegationSubmissionAttachments[submissionId] || [];
        allSubmissionAttachments.push(...attachments);
      });

      if (allSubmissionAttachments.length > 0) {
        const attachmentMetadataPromises = allSubmissionAttachments.map(
          async (attachmentId) => {
            try {
              const metadata = await FileService.getAttachmentMetadata(
                attachmentId
              );
              setMetadata(attachmentId, metadata);
              return { attachmentId, metadata };
            } catch (error) {
              return { attachmentId, metadata: null };
            }
          }
        );

        const results = await Promise.all(attachmentMetadataPromises);
        const attachmentMap = results.reduce(
          (acc, { attachmentId, metadata }) => {
            if (metadata) {
              acc[attachmentId] = metadata;
            }
            return acc;
          },
          {} as { [attachmentId: string]: any }
        );

        setSubmissionAttachmentsMetadata(attachmentMap);
      }
    };

    loadSubmissionAttachmentsMetadata();
  }, [submissions, delegationSubmissionAttachments, setMetadata]);

  const handleAttachmentClick = (attachmentId: string) => {
    const attachmentMetadata = delegationAttachmentsMetadata[attachmentId];
    if (attachmentMetadata) {
      openPreview({
        originalName: attachmentMetadata.originalName,
        tokenOrId: attachmentId,
        fileType: attachmentMetadata.fileType,
        sizeInBytes: attachmentMetadata.sizeInBytes,
        expiryDate: attachmentMetadata.expiryDate,
      });
    }
  };

  const handleApprove = async () => {
    if (!latestSubmission) {
      addToast({ message: "No submission to approve", type: "error" });
      return;
    }

    try {
      const response = await TaskDelegationService.approveSubmission(
        latestSubmission.id,
        {}
      );
      updateDelegation(delegation.id.toString(), response.delegation);
      addToast({ message: "Submission approved successfully", type: "success" });
    } catch (error: any) {
      addToast({
        message: error?.response?.data?.message || "Failed to approve submission",
        type: "error",
      });
    }
  };

  const handleReject = async () => {
    if (!latestSubmission) {
      addToast({ message: "No submission to reject", type: "error" });
      return;
    }

    try {
      const response = await TaskDelegationService.rejectSubmission(
        latestSubmission.id,
        {}
      );
      updateDelegation(delegation.id.toString(), response.delegation);
      addToast({ message: "Submission rejected successfully", type: "success" });
    } catch (error: any) {
      addToast({
        message: error?.response?.data?.message || "Failed to reject submission",
        type: "error",
      });
    }
  };

  const handleForward = async () => {
    if (!latestSubmission) {
      addToast({ message: "No submission to forward", type: "error" });
      return;
    }

    try {
      await TaskDelegationService.forwardSubmission(
        latestSubmission.id,
        {}
      );
      addToast({ message: "Submission forwarded successfully", type: "success" });
    } catch (error: any) {
      addToast({
        message: error?.response?.data?.message || "Failed to forward submission",
        type: "error",
      });
    }
  };

  const task = delegation.task;
  if (!task) return null;

  return (
    <div className="relative bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Priority colored line on the left */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 ${getPriorityColor(
          task.priority || "MEDIUM"
        )} rounded-l-lg`}
      ></div>

      <div className="flex items-start gap-3 ml-2">
        {/* Task content */}
        <div className="flex-1 min-w-0">
          {/* Title and actions row */}
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-900 text-sm">
              {task.title}
            </h3>
            <div className="flex items-center gap-1">
              <button
                className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
                title="View Details"
              >
                <Eye className="w-4 h-4" />
              </button>
              {latestSubmission && (
                <ThreeDotMenu
                  options={[
                    {
                      label: "Approve",
                      onClick: handleApprove,
                      color: "green",
                    },
                    {
                      label: "Reject",
                      onClick: handleReject,
                      color: "red",
                    },
                    {
                      label: "Forward",
                      onClick: handleForward,
                      color: "blue",
                    },
                  ]}
                />
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-gray-600 mb-3">{task.description}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 flex items-center gap-1">
              <DelegationIcon className="w-3 h-3" />
              Delegated
            </span>
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                delegation.status
              )}`}
            >
              {delegation.status?.replace("_", " ") || "TODO"}
            </span>
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${task.priority === "HIGH"
                ? "bg-red-100 text-red-800"
                : task.priority === "MEDIUM"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-green-100 text-green-800"
                }`}
            >
              {task.priority}
            </span>
            {delegation.assignmentType && (
              <span className="px-2 py-1 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                {delegation.assignmentType === "INDIVIDUAL" ? "Individual" : "Sub-Department"}
              </span>
            )}
          </div>

          {/* Assignment Info */}
          <div className="text-xs text-gray-500 mb-3">
            {delegation.assignmentType === "INDIVIDUAL" && delegation.assignee ? (
              <p>
                Assigned to: <span className="font-medium">{delegation.assignee.user?.name || "Employee"}</span>
              </p>
            ) : delegation.targetSubDepartment ? (
              <p>
                Assigned to: <span className="font-medium">{delegation.targetSubDepartment.name}</span>
              </p>
            ) : null}
          </div>

          {/* Due date */}
          {task.dueDate && (
            <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
              <Clock className="w-3 h-3" />
              <span>
                Due:{" "}
                {new Date(task.dueDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </span>
            </div>
          )}

          {/* Attachments */}
          {delegationAttachmentIds.length > 0 && (
            <div className="border-t border-gray-200 pt-3 mb-3">
              <div className="space-y-2">
                {delegationAttachmentIds.map((attachmentId, index) => {
                  const attachmentMetadata =
                    delegationAttachmentsMetadata[attachmentId];
                  const fileName =
                    attachmentMetadata?.originalName ||
                    `Attachment ${index + 1}`;

                  return (
                    <div
                      key={attachmentId}
                      className="flex items-center gap-2 text-xs cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors"
                      onClick={() => handleAttachmentClick(attachmentId)}
                    >
                      <PaperClipIcon className="w-3 h-3 text-blue-500" />
                      <span className="truncate text-blue-500 hover:text-blue-600 transition-colors">
                        {fileName}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Submissions */}
          {submissions.length > 0 && (
            <div className="border-t border-gray-200 pt-3">
              <button
                onClick={() => setIsSubmissionsExpanded(!isSubmissionsExpanded)}
                className="text-xs font-medium text-gray-700 hover:text-purple-600 transition-colors mb-2"
              >
                {isSubmissionsExpanded ? "Hide" : "Show"} Submissions (
                {submissions.length})
              </button>
              {isSubmissionsExpanded && (
                <div className="space-y-2 mt-2">
                  {submissions.map((submission) => {
                    const submissionId = submission.id.toString();
                    const submissionAttachments = delegationSubmissionAttachments[submissionId] || [];
                    const hasAttachments = submissionAttachments.length > 0;

                    return (
                      <div
                        key={submission.id.toString()}
                        className="bg-gray-50 rounded p-2 text-xs"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">
                            {submission.performerName || submission.performerType}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-xs ${getSubmissionStatusColor(
                              submission.status
                            )}`}
                          >
                            {submission.status}
                          </span>
                        </div>
                        {submission.notes && (
                          <p className="text-gray-600 mt-1">{submission.notes}</p>
                        )}
                        {submission.feedback && (
                          <p className="text-gray-500 mt-1 italic">
                            Feedback: {submission.feedback}
                          </p>
                        )}
                        {hasAttachments && (
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center gap-1 text-gray-500">
                              <PaperClipIcon className="w-3 h-3" />
                              <span>Attachments ({submissionAttachments.length})</span>
                            </div>
                            <div className="space-y-1 pl-4">
                              {submissionAttachments.map((attachmentId, index) => {
                                const attachmentMetadata =
                                  submissionAttachmentsMetadata[attachmentId];
                                const fileName =
                                  attachmentMetadata?.originalName ||
                                  `Attachment ${index + 1}`;

                                return (
                                  <div
                                    key={attachmentId}
                                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors"
                                    onClick={() => {
                                      if (attachmentMetadata) {
                                        openPreview({
                                          originalName: attachmentMetadata.originalName,
                                          tokenOrId: attachmentId,
                                          fileType: attachmentMetadata.fileType,
                                          sizeInBytes: attachmentMetadata.sizeInBytes,
                                          expiryDate: attachmentMetadata.expiryDate,
                                        });
                                      }
                                    }}
                                  >
                                    <PaperClipIcon className="w-3 h-3 text-blue-500" />
                                    <span className="truncate text-blue-500 hover:text-blue-600 transition-colors">
                                      {fileName}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        <p className="text-gray-400 mt-1">
                          Submitted:{" "}
                          {new Date(submission.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

