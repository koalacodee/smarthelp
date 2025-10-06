"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AttachmentInput from "@/components/ui/AttachmentInput";
import { FileService } from "@/lib/api";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import { useCurrentEditingPromotionStore } from "../store/useCurrentEditingPromotion";
import { usePromotionsStore } from "../store/usePromotionsStore";
import { useAttachmentStore } from "@/app/(dashboard)/store/useAttachmentStore";
import {
  useAttachmentsStore,
  usePromotionAttachments,
} from "@/lib/store/useAttachmentsStore";
import { useMediaMetadataStore } from "@/lib/store/useMediaMetadataStore";
import {
  createPromotionService,
  AudienceType,
} from "@/lib/api/v2/services/promotion";
import { createUploadService } from "@/lib/api/v2/services/shared/upload";
import useFormErrors from "@/hooks/useFormErrors";
import axios from "axios";
import { PromotionService, UploadService } from "@/lib/api/v2";

export default function PromotionEditModal() {
  const { clearErrors, setErrors, setRootError, errors } = useFormErrors([
    "title",
    "audience",
    "startDate",
    "endDate",
  ]);
  const [title, setTitle] = useState("");
  const [audience, setAudience] = useState<AudienceType>(AudienceType.ALL);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [attachmentRefreshKey, setAttachmentRefreshKey] = useState(0);
  const { addToast } = useToastStore();
  const { promotion, setIsEditing, isEditing } =
    useCurrentEditingPromotionStore();
  const { addPromotion, updatePromotion } = usePromotionsStore();
  const { getFormData, attachments } = useAttachmentStore();
  const { addAttachments } = useAttachmentsStore();
  const { getPromotionAttachments } = usePromotionAttachments();
  const { setMetadata } = useMediaMetadataStore();
  const { addExistingAttachment } = useAttachmentStore();

  const {
    existingsToDelete,
    clearAttachments,
    clearExistingsToDelete,
    setExistingAttachments,
  } = useAttachmentStore();

  // Create axios instance with auth
  const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001",
  });

  // Add auth interceptor
  axiosInstance.interceptors.request.use((config) => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("auth-token="))
      ?.split("=")[1];

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Effect to handle promotion changes and load initial data
  useEffect(() => {
    if (promotion) {
      setTitle(promotion.title);
      setAudience(promotion.audience || AudienceType.ALL);
      setStartDate(
        promotion.startDate ? promotion.startDate.split("T")[0] : ""
      );
      setEndDate(promotion.endDate ? promotion.endDate.split("T")[0] : "");
    } else {
      // Reset for new promotion
      setTitle("");
      setAudience(AudienceType.ALL);
      setStartDate("");
      setEndDate("");
    }
  }, [promotion]);

  // Separate effect to handle attachment loading when promotion changes or attachments are updated
  useEffect(() => {
    // Clear existing attachments first
    clearAttachments();
    clearExistingsToDelete();
    setExistingAttachments({});
    if (promotion) {
      const loadAttachments = async () => {
        const promises = getPromotionAttachments(promotion.id).map((id) =>
          FileService.getAttachmentMetadata(id).then((m) => {
            setMetadata(id, m);
            addExistingAttachment(id, m);
            return [id, m];
          })
        );

        await Promise.all(promises);
      };
      loadAttachments();
    }
  }, [promotion?.id, attachmentRefreshKey]); // Include refresh key to reload when attachments are updated

  // Effect to refresh attachments when modal opens
  useEffect(() => {
    if (isEditing && promotion) {
      setAttachmentRefreshKey((prev) => prev + 1);
    }
  }, [isEditing, promotion?.id]);

  const handleClose = () => {
    setIsEditing(false);
    // Reset attachment refresh key when closing
    setAttachmentRefreshKey(0);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    if (!title || !audience) {
      setRootError("Please fill all required fields.");
      return;
    }

    const formData = attachments.length > 0 ? getFormData() : undefined;

    if (promotion) {
      // Update existing promotion
      PromotionService.updatePromotion(promotion.id, {
        title,
        audience,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        deleteAttachments: Object.keys(existingsToDelete),
        attach: attachments.length > 0,
      })
        .then(async (response) => {
          addToast({
            message: "Promotion Updated Successfully!",
            type: "success",
          });
          // Update the promotion in the store
          updatePromotion(promotion.id, {
            title: response.promotion.title,
            audience: response.promotion.audience,
            startDate: response.promotion.startDate,
            endDate: response.promotion.endDate,
          });
          handleClose();

          if (formData && response.uploadKey) {
            try {
              const uploadedFilesResponse =
                await UploadService.uploadFromFormData(
                  formData,
                  response.uploadKey
                );

              console.log(uploadedFilesResponse);

              if (uploadedFilesResponse) {
                const { data: uploadedFiles } = uploadedFilesResponse;
                if (Array.isArray(uploadedFiles)) {
                  addAttachments(
                    "promotion",
                    promotion.id,
                    uploadedFiles.map((file) => file.id)
                  );
                } else {
                  addAttachments("promotion", promotion.id, [uploadedFiles.id]);
                }
                // Trigger attachment refresh to reload the modal
                setAttachmentRefreshKey((prev) => prev + 1);
              }
            } catch (uploadError) {
              console.error("Upload error:", uploadError);
              addToast({
                message: "Promotion updated but failed to upload attachments",
                type: "info",
              });
            }
          }
        })
        .catch((error) => {
          console.error("Update promotion error:", error);
          console.log("Update promotion error:", error);
          console.log("Error response data:", error?.response?.data);

          if (error?.response?.data?.data?.details) {
            console.log(
              "Setting field errors:",
              error?.response?.data?.data?.details
            );
            setErrors(error?.response?.data?.data?.details);
          } else {
            console.log("Setting root error");
            setRootError(
              error?.response?.data?.message ||
                "Failed to update promotion. Please try again."
            );
          }
        });
    } else {
      // Create new promotion
      PromotionService.createPromotion({
        title,
        audience,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        attach: attachments.length > 0,
      })
        .then(async (response) => {
          addToast({
            message: "Promotion Created Successfully!",
            type: "success",
          });
          // Add the new promotion to the store
          addPromotion(response.promotion);
          handleClose();

          if (formData && response.uploadKey) {
            try {
              const uploadedFilesResponse =
                await UploadService.uploadFromFormData(
                  formData,
                  response.uploadKey
                );

              console.log(uploadedFilesResponse);

              if (uploadedFilesResponse) {
                const { data: uploadedFiles } = uploadedFilesResponse;
                if (Array.isArray(uploadedFiles)) {
                  addAttachments(
                    "promotion",
                    response.promotion.id,
                    uploadedFiles.map((file) => file.id)
                  );
                } else {
                  addAttachments("promotion", response.promotion.id, [
                    uploadedFiles.id,
                  ]);
                }
                // Trigger attachment refresh to reload the modal
                setAttachmentRefreshKey((prev) => prev + 1);
              }
            } catch (uploadError) {
              console.error("Upload error:", uploadError);
              addToast({
                message: "Promotion created but failed to upload attachments",
                type: "info",
              });
            }
          }
        })
        .catch((error) => {
          console.error("Create promotion error:", error);
          console.log("Create promotion error:", error);
          console.log("Error response data:", error?.response?.data);

          if (error?.response?.data?.data?.details) {
            console.log(
              "Setting field errors:",
              error?.response?.data?.data?.details
            );
            setErrors(error?.response?.data?.data?.details);
          } else {
            console.log("Setting root error");
            setRootError(
              error?.response?.data?.message ||
                "Failed to create promotion. Please try again."
            );
          }
        });
    }

    // Clear attachment store state
    clearAttachments();
    clearExistingsToDelete();
    setExistingAttachments({});
  };

  const modalTitle = promotion ? "Edit Promotion" : "Add New Promotion";

  if (!isEditing) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4"
        onClick={handleClose}
        aria-modal="true"
        role="dialog"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20"
          onClick={(e) => e.stopPropagation()}
        >
          <form onSubmit={handleSave}>
            <motion.h3
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-2xl font-bold mb-6 bg-gradient-to-r from-slate-800 to-purple-800 bg-clip-text text-transparent"
            >
              {modalTitle}
            </motion.h3>

            <AnimatePresence>
              {errors.root && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl"
                >
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="flex items-center gap-2"
                  >
                    <motion.svg
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: 0.2,
                        ease: "backOut",
                      }}
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </motion.svg>
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                    >
                      {errors.root}
                    </motion.span>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="space-y-6"
            >
              {/* Title Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <motion.label
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  htmlFor="promotion-title"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Promotion Title *
                </motion.label>
                <motion.input
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                  whileFocus={{
                    scale: 1.02,
                    boxShadow: "0 0 0 3px rgba(147, 51, 234, 0.1)",
                  }}
                  id="promotion-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 bg-slate-50/50"
                  placeholder="e.g., Summer Sale 2024"
                  required
                />
                {errors.title && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="mt-1 text-sm text-red-700"
                  >
                    {errors.title}
                  </motion.p>
                )}
              </motion.div>

              {/* Audience Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <motion.label
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                  htmlFor="promotion-audience"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Target Audience *
                </motion.label>
                <div className="relative">
                  <motion.select
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.6 }}
                    whileFocus={{
                      scale: 1.02,
                      boxShadow: "0 0 0 3px rgba(147, 51, 234, 0.1)",
                    }}
                    id="promotion-audience"
                    value={audience}
                    onChange={(e) =>
                      setAudience(e.target.value as AudienceType)
                    }
                    className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-slate-50/50 transition-all duration-200 appearance-none cursor-pointer"
                    required
                  >
                    <option value={AudienceType.ALL}>All</option>
                    <option value={AudienceType.CUSTOMER}>Customer</option>
                    <option value={AudienceType.SUPERVISOR}>Supervisor</option>
                    <option value={AudienceType.EMPLOYEE}>Employee</option>
                  </motion.select>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: 0.7 }}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
                  >
                    <svg
                      className="h-5 w-5 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </motion.div>
                </div>
                {errors.audience && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="mt-1 text-sm text-red-700"
                  >
                    {errors.audience}
                  </motion.p>
                )}
              </motion.div>

              {/* Date Fields */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-6"
              >
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                >
                  <motion.label
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.7 }}
                    htmlFor="promotion-start-date"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Start Date (Optional)
                  </motion.label>
                  <motion.input
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.8 }}
                    whileFocus={{
                      scale: 1.02,
                      boxShadow: "0 0 0 3px rgba(147, 51, 234, 0.1)",
                    }}
                    id="promotion-start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 bg-slate-50/50"
                  />
                  {errors.startDate && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className="mt-1 text-sm text-red-700"
                    >
                      {errors.startDate}
                    </motion.p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                >
                  <motion.label
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.7 }}
                    htmlFor="promotion-end-date"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    End Date (Optional)
                  </motion.label>
                  <motion.input
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.8 }}
                    whileFocus={{
                      scale: 1.02,
                      boxShadow: "0 0 0 3px rgba(147, 51, 234, 0.1)",
                    }}
                    id="promotion-end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 bg-slate-50/50"
                  />
                  {errors.endDate && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className="mt-1 text-sm text-red-700"
                    >
                      {errors.endDate}
                    </motion.p>
                  )}
                </motion.div>
              </motion.div>

              {/* Attachments */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.7 }}
              >
                <AttachmentInput
                  id="promotion-attachment-input"
                  attachmentType="promotion"
                  attachmentId={promotion?.id}
                  getAttachmentTokens={getPromotionAttachments}
                />
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.8 }}
              className="mt-8 flex justify-end gap-4"
            >
              <motion.button
                type="button"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.9 }}
                whileHover={{
                  scale: 1.05,
                  backgroundColor: "rgb(148 163 184)",
                }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClose}
                className="px-6 py-3 bg-slate-200 rounded-xl text-sm font-medium hover:bg-slate-300 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 1 }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 8px 20px -5px rgba(147, 51, 234, 0.4)",
                  backgroundColor: "rgb(126 34 206)",
                }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Save Changes
              </motion.button>
            </motion.div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
