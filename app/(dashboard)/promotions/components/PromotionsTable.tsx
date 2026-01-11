"use client";
import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePromotionsStore } from "../store/usePromotionsStore";
import { useCurrentEditingPromotionStore } from "../store/useCurrentEditingPromotion";
import { PromotionDTO } from "@/lib/api/v2/services/promotion";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import RefreshButton from "@/components/ui/RefreshButton";
import ThreeDotMenu from "@/app/(dashboard)/tasks/components/ThreeDotMenu";
import { PromotionService } from "@/lib/api/v2";
import { FileHubAttachment } from "@/lib/api/v2/services/shared/filehub";
import { useAttachments } from "@/hooks/useAttachments";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import { useConfirmationModalStore } from "@/app/(dashboard)/store/useConfirmationStore";
import { formatDateWithHijri } from "@/locales/dateFormatter";

export default function PromotionsTable({
  promotions,
  attachments,
  fileHubAttachments,
}: {
  promotions: PromotionDTO[];
  attachments: Record<string, string[]>;
  fileHubAttachments: FileHubAttachment[];
}) {
  const {
    filteredPromotions,
    setPromotions,
    removePromotion,
    togglePromotionActive,
  } = usePromotionsStore();
  const { setPromotion, setIsEditing } = useCurrentEditingPromotionStore();
  const { addToast } = useToastStore();
  const { clearExistingAttachmentsForTarget, addExistingAttachmentToTarget } =
    useAttachments();
  const { locale } = useLocaleStore();
  const language = useLocaleStore((state) => state.language);
  const { openModal: openConfirmation } = useConfirmationModalStore();

  const setData = (props: {
    promotions: PromotionDTO[];
    attachments: Record<string, string[]>;
    fileHubAttachments: FileHubAttachment[];
  }) => {
    setPromotions(props.promotions);
    if (props.fileHubAttachments && props.fileHubAttachments.length > 0) {
      const allTargetIds = new Set<string>();

      props.fileHubAttachments?.forEach((attachment) => {
        if (attachment.targetId) {
          allTargetIds.add(attachment.targetId);
        }
      });

      allTargetIds.forEach((targetId) => {
        clearExistingAttachmentsForTarget(targetId);
      });

      fileHubAttachments?.forEach((attachment) => {
        if (attachment.targetId) {
          addExistingAttachmentToTarget(attachment.targetId, {
            fileType: attachment.type,
            originalName: attachment.originalName,
            size: attachment.size,
            expirationDate: attachment.expirationDate,
            id: attachment.id,
            filename: attachment.filename,
            isGlobal: attachment.isGlobal,
            createdAt: attachment.createdAt,
            signedUrl: attachment.signedUrl,
          });
        }
      });
    }
  };
  useEffect(() => {
    setData({ fileHubAttachments, attachments, promotions });
  }, [promotions, attachments, fileHubAttachments]);

  async function loadPromotions() {
    try {
      const res = await PromotionService.getAllPromotions();
      setData({
        promotions: res.promotions,
        fileHubAttachments: res.fileHubAttachments,
        attachments: res.attachments,
      });
    } catch (error) {
      addToast({
        message:
          locale?.promotions?.toasts?.loadFailed || "Failed to load promotions",
        type: "error",
      });
    }
  }

  const handleEdit = (promotion: PromotionDTO) => {
    setPromotion(promotion);
    setIsEditing(true);
  };

  const handleToggleActive = async (promotion: PromotionDTO) => {
    try {
      await PromotionService.togglePromotionActive(promotion.id);
      togglePromotionActive(promotion.id);
      addToast({
        message: promotion.isActive
          ? locale?.promotions?.toasts?.deactivateSuccess ||
            "Promotion deactivated"
          : locale?.promotions?.toasts?.activateSuccess ||
            "Promotion activated",
        type: "success",
      });
    } catch (error: any) {
      addToast({
        message:
          locale?.promotions?.toasts?.statusUpdateFailed ||
          "Failed to update status",
        type: "error",
      });
    }
  };

  const handleDelete = async (promotion: PromotionDTO) => {
    openConfirmation({
      title:
        locale?.promotions?.confirmations?.deleteTitle || "Delete Promotion",
      message:
        locale?.promotions?.confirmations?.deleteMessage ||
        "Are you sure you want to delete this promotion?",
      confirmText: locale?.promotions?.confirmations?.confirmText || "Confirm",
      cancelText: locale?.promotions?.confirmations?.cancelText || "Cancel",
      onConfirm: async () => {
        try {
          await PromotionService.deletePromotion(promotion.id);
          removePromotion(promotion.id);
          addToast({
            message:
              locale?.promotions?.toasts?.deleteSuccess ||
              "Promotion deleted successfully",
            type: "success",
          });
        } catch (error: any) {
          addToast({
            message:
              locale?.promotions?.toasts?.deleteFailed ||
              "Failed to delete promotion",
            type: "error",
          });
        }
      },
    });
  };

  const getAudienceLabel = (audience?: string) => {
    switch (audience) {
      case "ALL":
        return locale?.promotions?.table?.audience?.all || "All";
      case "CUSTOMER":
        return locale?.promotions?.table?.audience?.customer || "Customer";
      case "SUPERVISOR":
        return locale?.promotions?.table?.audience?.supervisor || "Supervisor";
      case "EMPLOYEE":
        return locale?.promotions?.table?.audience?.employee || "Employee";
      default:
        return locale?.promotions?.table?.audience?.all || "All";
    }
  };

  if (!locale) return null;

  const getStatusColor = (isActive?: boolean) => {
    return isActive
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-red-100 text-red-800 border-red-200";
  };

  return (
    <>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="bg-gradient-to-r from-slate-50 to-purple-50/50 px-6 py-4 border-b border-slate-200"
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ rotate: -90, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.5, ease: "backOut" }}
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
                  d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                />
              </svg>
            </motion.div>
            <div>
              <motion.h2
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.6 }}
                className="text-lg font-semibold text-slate-800"
              >
                {locale.promotions.table.title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.7 }}
                className="text-sm text-slate-600"
              >
                {locale.promotions.table.count
                  .replace("{count}", filteredPromotions.length.toString())
                  .replace(
                    "{plural}",
                    filteredPromotions.length !== 1 ? "s" : ""
                  )}
              </motion.p>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.8 }}
          >
            <RefreshButton onRefresh={loadPromotions} />
          </motion.div>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.9 }}
        className="overflow-hidden"
      >
        <table className="min-w-full divide-y divide-slate-200">
          <tbody className="bg-white divide-y divide-slate-200">
            <AnimatePresence mode="wait">
              {filteredPromotions.length === 0 ? (
                <motion.tr
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                      className="flex flex-col items-center justify-center space-y-4"
                    >
                      <motion.div
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                          duration: 0.4,
                          delay: 0.3,
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
                            d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                          />
                        </svg>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.4 }}
                        className="text-slate-500"
                      >
                        <p className="text-lg font-medium mb-2">
                          {locale.promotions.table.empty.title}
                        </p>
                        <p className="text-sm">
                          {locale.promotions.table.empty.hint}
                        </p>
                      </motion.div>
                    </motion.div>
                  </td>
                </motion.tr>
              ) : (
                filteredPromotions.map((promotion, index) => (
                  <motion.tr
                    key={promotion.id}
                    initial={{ opacity: 0, x: -15, scale: 0.98 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{
                      duration: 0.3,
                      delay: 1 + index * 0.05,
                    }}
                    whileHover={{
                      backgroundColor: "rgb(248 250 252)",
                      transition: { duration: 0.2 },
                    }}
                    className="group hover:bg-slate-50 transition-all duration-200 border-b border-slate-100 last:border-b-0"
                  >
                    {/* Title */}
                    <td className="px-6 py-4 max-w-md">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{
                          duration: 0.2,
                          delay: 1.1 + index * 0.05,
                        }}
                        className="flex items-start gap-3"
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            duration: 0.2,
                            delay: 1.2 + index * 0.05,
                          }}
                          className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"
                        />
                        <p
                          className="text-sm text-slate-900 leading-relaxed"
                          title={promotion.title}
                        >
                          {promotion.title}
                        </p>
                      </motion.div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          duration: 0.2,
                          delay: 1.1 + index * 0.05,
                        }}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                          promotion.isActive
                        )}`}
                      >
                        {promotion.isActive
                          ? locale.promotions.table.status.active
                          : locale.promotions.table.status.inactive}
                      </motion.span>
                    </td>

                    {/* Audience */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          duration: 0.2,
                          delay: 1.1 + index * 0.05,
                        }}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800"
                      >
                        {getAudienceLabel(promotion.audience)}
                      </motion.span>
                    </td>

                    {/* Start Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{
                          duration: 0.2,
                          delay: 1.1 + index * 0.05,
                        }}
                        className="flex items-center justify-center gap-1"
                      >
                        <svg
                          className="w-4 h-4 text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-sm font-medium text-slate-600">
                          {formatDateWithHijri(promotion.startDate, language)}
                        </span>
                      </motion.div>
                    </td>

                    {/* End Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{
                          duration: 0.2,
                          delay: 1.1 + index * 0.05,
                        }}
                        className="flex items-center justify-center gap-1"
                      >
                        <svg
                          className="w-4 h-4 text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-sm font-medium text-slate-600">
                          {promotion.endDate
                            ? formatDateWithHijri(
                                promotion.endDate,
                                language,
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                },
                                locale.promotions.table.notSet
                              )
                            : locale.promotions.table.notSet}
                        </span>
                      </motion.div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <ThreeDotMenu
                          options={[
                            {
                              label: locale.promotions.table.actions.edit,
                              onClick: () => handleEdit(promotion),
                              color: "blue",
                            },
                            {
                              label: promotion.isActive
                                ? locale.promotions.table.actions.deactivate
                                : locale.promotions.table.actions.activate,
                              onClick: () => handleToggleActive(promotion),
                              color: promotion.isActive ? "gray" : "green",
                            },
                            {
                              label: locale.promotions.table.actions.delete,
                              onClick: () => handleDelete(promotion),
                              color: "red",
                            },
                          ]}
                        />
                      </motion.div>
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </motion.div>
    </>
  );
}
