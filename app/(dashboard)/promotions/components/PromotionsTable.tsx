"use client";
import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePromotionsStore } from "../store/usePromotionsStore";
import { useCurrentEditingPromotionStore } from "../store/useCurrentEditingPromotion";
import { PromotionDTO } from "@/lib/api/v2/services/promotion";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import { createPromotionService } from "@/lib/api/v2/services/promotion";
import RefreshButton from "@/components/ui/RefreshButton";
import ThreeDotMenu from "@/app/(dashboard)/tasks/components/ThreeDotMenu";
import { usePromotionAttachments } from "@/lib/store/useAttachmentsStore";
import axios from "axios";
import { PromotionService } from "@/lib/api/v2";

export default function PromotionsTable({
  promotions,
  attachments,
}: {
  promotions: PromotionDTO[];
  attachments: Record<string, string[]>;
}) {
  const {
    filteredPromotions,
    setPromotions,
    removePromotion,
    togglePromotionActive,
  } = usePromotionsStore();
  const { setPromotion, setIsEditing } = useCurrentEditingPromotionStore();
  const { addToast } = useToastStore();
  const { setPromotionAttachments, getPromotionAttachments } =
    usePromotionAttachments();

  useEffect(() => {
    setPromotions(promotions);
    setPromotionAttachments(attachments);
  }, [promotions, attachments]);

  // Create axios instance with auth
  const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001",
  });

  async function loadPromotions() {
    try {
      const res = await PromotionService.getAllPromotions();
      setPromotions(res.promotions);
      setPromotionAttachments(res.attachments);
    } catch (error) {
      console.error("Failed to load promotions:", error);
      addToast({
        message: "Failed to load promotions",
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
        message: `Promotion ${
          promotion.isActive ? "deactivated" : "activated"
        } successfully`,
        type: "success",
      });
    } catch (error: any) {
      console.error("Failed to toggle promotion status:", error);
      addToast({
        message: "Failed to update promotion status",
        type: "error",
      });
    }
  };

  const handleDelete = async (promotion: PromotionDTO) => {
    if (
      !confirm(
        "Are you sure you want to delete this promotion? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await PromotionService.deletePromotion(promotion.id);
      removePromotion(promotion.id);
      addToast({
        message: "Promotion deleted successfully",
        type: "success",
      });
    } catch (error: any) {
      console.error("Failed to delete promotion:", error);
      addToast({
        message: "Failed to delete promotion",
        type: "error",
      });
    }
  };

  const getAudienceLabel = (audience?: string) => {
    switch (audience) {
      case "ALL":
        return "All";
      case "CUSTOMER":
        return "Customer";
      case "SUPERVISOR":
        return "Supervisor";
      case "EMPLOYEE":
        return "Employee";
      default:
        return "All";
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

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
                Promotions Database
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.7 }}
                className="text-sm text-slate-600"
              >
                {filteredPromotions.length} promotion
                {filteredPromotions.length !== 1 ? "s" : ""} available
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
                          No promotions found
                        </p>
                        <p className="text-sm">
                          Try adjusting your search or filter criteria
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
                        {promotion.isActive ? "Active" : "Inactive"}
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
                          {formatDate(promotion.startDate)}
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
                          {formatDate(promotion.endDate)}
                        </span>
                      </motion.div>
                    </td>

                    {/* Attachments */}
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
                            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                          />
                        </svg>
                        <span className="text-sm font-medium text-slate-600">
                          {getPromotionAttachments(promotion.id)?.length || 0}
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
                              label: "Edit",
                              onClick: () => handleEdit(promotion),
                              color: "blue",
                            },
                            {
                              label: promotion.isActive
                                ? "Deactivate"
                                : "Activate",
                              onClick: () => handleToggleActive(promotion),
                              color: promotion.isActive ? "gray" : "green",
                            },
                            {
                              label: "Delete",
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
