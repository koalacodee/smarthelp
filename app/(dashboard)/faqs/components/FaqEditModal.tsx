"use client";
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AttachmentInput from "@/components/ui/AttachmentInput";
import api, { FileService } from "@/lib/api";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import { useCurrentEditingFAQStore } from "../store/useCurrentEditingFAQ";
import { Department } from "@/lib/api/departments";
import { useGroupedFAQsStore } from "../store/useGroupedFAQsStore";
import { useAttachmentStore } from "@/app/(dashboard)/store/useAttachmentStore";
import { useAttachmentsStore } from "@/lib/store/useAttachmentsStore";
import { useMediaMetadataStore } from "@/lib/store/useMediaMetadataStore";
import { FAQService, UploadService } from "@/lib/api/v2";
import useFormErrors from "@/hooks/useFormErrors";
import { TRANSLATION_MAP } from "@/constants/translation";
import type { SupportedLanguage } from "@/types/translation";

export default function FaqEditModal() {
  const { clearErrors, setErrors, setRootError, errors } = useFormErrors([
    "question",
    "answer",
    "departmentId",
  ]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [subDepartmentId, setSubDepartmentId] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subDepartments, setSubDepartments] = useState<Department[]>([]);
  const [attachmentRefreshKey, setAttachmentRefreshKey] = useState(0);
  const [translateTo, setTranslateTo] = useState<SupportedLanguage[]>([]);
  const { addToast } = useToastStore();
  const { faq, setIsEditing, isEditing } = useCurrentEditingFAQStore();
  const { addFAQ, updateFAQ } = useGroupedFAQsStore();
  const { getFormData, attachments } = useAttachmentStore();
  const { getAttachments, addAttachments } = useAttachmentsStore();
  const { setMetadata } = useMediaMetadataStore();
  const { addExistingAttachment } = useAttachmentStore();

  useEffect(() => {
    Promise.all([
      api.DepartmentsService.getAllDepartments().then(setDepartments),
      api.DepartmentsService.getAllSubDepartments().then(setSubDepartments),
    ]);
  }, []);
  const {
    existingsToDelete,
    clearAttachments,
    clearExistingsToDelete,
    setExistingAttachments,
    selectedAttachmentIds,
    moveAllSelectedToExisting,
  } = useAttachmentStore();

  const subDepartmentsForCategory = useMemo(() => {
    if (!departmentId) return [];
    return subDepartments.filter((sd) => sd.parent?.id === departmentId);
  }, [departmentId, subDepartments]);

  // Effect to handle FAQ changes and load initial data
  useEffect(() => {
    if (faq) {
      const init = async () => {
        setQuestion(faq.text);
        setAnswer(faq.answer || "");
        setTranslateTo(faq.availableLangs);

        // Check if departmentId is a main category
        const mainDept = departments.find(
          (dept) => dept.id === faq.departmentId
        );
        if (mainDept) {
          // It's a main category
          setDepartmentId(faq.departmentId);
          setSubDepartmentId(null);
        } else {
          // Check if it's a sub-department
          const subDept = subDepartments.find(
            (dept) => dept.id === faq.departmentId
          );
          if (subDept) {
            // It's a sub-department
            setSubDepartmentId(faq.departmentId);
            setDepartmentId(subDept.parent?.id || "");
          } else {
            // Fallback - assume it's a main category
            setDepartmentId(faq.departmentId);
            setSubDepartmentId(null);
          }
        }
      };
      init();
    } else {
      // Reset for new FAQ, default to first available category
      setQuestion("");
      setAnswer("");
      const firstCatId = departments[0]?.id || "";
      setDepartmentId(firstCatId);
      setSubDepartmentId(null);
    }
  }, [faq, departments, subDepartments]);

  // Separate effect to handle attachment loading when FAQ changes or attachments are updated
  useEffect(() => {
    // Clear existing attachments first
    clearAttachments();
    clearExistingsToDelete();
    setExistingAttachments({});
    if (faq) {
      const loadAttachments = async () => {
        const promises = getAttachments("faq", faq.id).map((id) =>
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
  }, [faq?.id, attachmentRefreshKey]); // Include refresh key to reload when attachments are updated

  // Effect to refresh attachments when modal opens
  useEffect(() => {
    if (isEditing && faq) {
      setAttachmentRefreshKey((prev) => prev + 1);
    }
  }, [isEditing, faq?.id]);

  useEffect(() => {
    // When category changes, reset sub-department if it's no longer valid
    if (!subDepartmentsForCategory.some((sd) => sd.id === subDepartmentId)) {
      setSubDepartmentId(null);
    }
  }, [departmentId, subDepartmentsForCategory, subDepartmentId]);

  const toggleLanguage = (language: SupportedLanguage) => {
    setTranslateTo((prev) =>
      prev.includes(language)
        ? prev.filter((l) => l !== language)
        : [...prev, language]
    );
  };

  const handleClose = () => {
    setIsEditing(false);
    // Reset attachment refresh key when closing
    setAttachmentRefreshKey(0);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    if (!question || !answer || !departmentId) {
      setRootError("Please fill all required fields.");
      return;
    }

    const deptId = subDepartmentId ?? departmentId;

    const formData = attachments.length > 0 ? getFormData() : undefined;
    if (faq) {
      FAQService.updateQuestion(faq.id, {
        text: question,
        answer,
        departmentId: deptId,
        deleteAttachments: Object.keys(existingsToDelete),
        attach: attachments.length > 0,
        chooseAttachments: Array.from(selectedAttachmentIds),
        translateTo: translateTo.length ? translateTo : undefined,
      })
        .then(async (response) => {
          const { question: updated } = response;
          addToast({
            message: "FAQ Updated Successfully!",
            type: "success",
          });
          // Simply update the FAQ in the store
          updateFAQ(faq.departmentId, faq.id, {
            id: faq.id,
            text: updated.text || question,
            answer: updated.answer || answer,
            departmentId: deptId,
            departmentName: [...departments, ...subDepartments].find(
              (dept) => dept.id === deptId
            )?.name,
          });
          handleClose();
          if (formData && response.uploadKey) {
            const uploadedFilesResponse =
              await UploadService.uploadFromFormData(
                formData,
                response.uploadKey
              );

            if (uploadedFilesResponse) {
              const { data: uploadedFiles } = uploadedFilesResponse;
              if (Array.isArray(uploadedFiles)) {
                addAttachments(
                  "faq",
                  faq.id,
                  uploadedFiles
                    .map((file) => file.id)
                    .concat(Array.from(selectedAttachmentIds))
                );
              } else {
                addAttachments("faq", faq.id, [
                  uploadedFiles.id,
                  ...Array.from(selectedAttachmentIds),
                ]);
              }
              // Trigger attachment refresh to reload the modal
              setAttachmentRefreshKey((prev) => prev + 1);
            }
          }
        })
        .catch((error) => {
          if (error?.response?.data?.data?.details) {
            setErrors(error?.response?.data?.data?.details);
          } else {
            setRootError(
              error?.response?.data?.message ||
                "Failed to update FAQ. Please try again."
            );
          }
        });
    } else {
      FAQService.createQuestion({
        text: question,
        answer,
        departmentId: deptId,
        attach: attachments.length > 0,
        chooseAttachments: Array.from(selectedAttachmentIds),
        translateTo: translateTo.length ? translateTo : undefined,
      })
        .then(async (response) => {
          const { question: created } = response;
          addToast({
            message: "FAQ Added Successfully!",
            type: "success",
          });
          // Add the new FAQ to the store
          addFAQ(deptId, {
            id: created.id!,
            text: created.text || question,
            answer: created.answer || answer,
            departmentId: deptId,
            satisfaction: 0,
            dissatisfaction: 0,
            views: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            availableLangs: translateTo ?? [],
          });
          handleClose();
          if (formData && response.uploadKey) {
            const uploadedFilesResponse =
              await UploadService.uploadFromFormData(
                formData,
                response.uploadKey
              );

            if (uploadedFilesResponse) {
              const { data: uploadedFiles } = uploadedFilesResponse;
              if (Array.isArray(uploadedFiles)) {
                addAttachments(
                  "faq",
                  created.id!,
                  uploadedFiles
                    .map((file) => file.id)
                    .concat(Array.from(selectedAttachmentIds))
                );
              } else {
                addAttachments("faq", created.id!, [
                  uploadedFiles.id,
                  ...Array.from(selectedAttachmentIds),
                ]);
              }
              // Trigger attachment refresh to reload the modal
              setAttachmentRefreshKey((prev) => prev + 1);
            }
          }
        })
        .catch((error) => {
          if (error?.response?.data?.data?.details) {
            setErrors(error?.response?.data?.data?.details);
          } else {
            setRootError(
              error?.response?.data?.message ||
                "Failed to add FAQ. Please try again."
            );
          }
        });
    }

    // Clear attachment store state

    clearAttachments();
    clearExistingsToDelete();
    setExistingAttachments({});
    moveAllSelectedToExisting();
    setTranslateTo([]);
  };

  const modalTitle = faq && faq.answer ? "Edit FAQ" : "Add New FAQ";
  const selectedCategoryName =
    departments.find((c) => c.id === departmentId)?.name || "Category";

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
              className="text-2xl font-bold mb-6 bg-gradient-to-r from-slate-800 to-blue-800 bg-clip-text text-transparent"
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
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <motion.label
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  htmlFor="faq-question"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Question
                </motion.label>
                <motion.input
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                  whileFocus={{
                    scale: 1.02,
                    boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
                  }}
                  id="faq-question"
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-slate-50/50"
                  required
                />
                {errors.question && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="mt-1 text-sm text-red-700"
                  >
                    {errors.question}
                  </motion.p>
                )}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <motion.label
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                  htmlFor="faq-answer"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Answer
                </motion.label>
                <motion.textarea
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                  whileFocus={{
                    scale: 1.02,
                    boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
                  }}
                  id="faq-answer"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={4}
                  className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-slate-50/50 resize-none"
                  required
                  placeholder="Provide a detailed answer to the question."
                />
                {errors.answer && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="mt-1 text-sm text-red-700"
                  >
                    {errors.answer}
                  </motion.p>
                )}
              </motion.div>
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
                    htmlFor="faq-category-modal"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Main Category
                  </motion.label>
                  <motion.select
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.8 }}
                    whileFocus={{
                      scale: 1.02,
                      boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
                    }}
                    id="faq-category-modal"
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 transition-all duration-200"
                    required
                  >
                    {departments.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </motion.select>
                  {errors.departmentId && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className="mt-1 text-sm text-red-700"
                    >
                      {errors.departmentId}
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
                    htmlFor="faq-subdepartment-modal"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Sub-department (Optional)
                  </motion.label>
                  <motion.select
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.8 }}
                    whileFocus={{
                      scale: 1.02,
                      boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
                    }}
                    id="faq-subdepartment-modal"
                    value={subDepartmentId || ""}
                    onChange={(e) => setSubDepartmentId(e.target.value || null)}
                    className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 disabled:bg-slate-100 disabled:opacity-50 transition-all duration-200"
                    disabled={subDepartmentsForCategory.length == 0}
                  >
                    <option value="">
                      {subDepartmentsForCategory.length !== 0
                        ? `All of ${selectedCategoryName}`
                        : "No Sub-Departments"}
                    </option>
                    {subDepartmentsForCategory.map((sd) => (
                      <option key={sd.id} value={sd.id}>
                        {sd.name}
                      </option>
                    ))}
                  </motion.select>
                </motion.div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.7 }}
              >
                <AttachmentInput
                  id="faq-attachment-input"
                  attachmentType="faq"
                  attachmentId={faq?.id}
                  getAttachmentTokens={getAttachments}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.7 }}
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.8 }}
                  className="flex items-center gap-2 mb-4"
                >
                  <label className="text-sm font-medium text-slate-700">
                    Translate To (Optional)
                  </label>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.9 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto border border-slate-200 rounded-xl p-4 bg-slate-50/30"
                >
                  {Object.entries(TRANSLATION_MAP).map(
                    ([code, label], index) => {
                      const lang = code as SupportedLanguage;
                      const isSelected = translateTo.includes(lang);
                      return (
                        <motion.button
                          key={code}
                          type="button"
                          initial={{ opacity: 0, scale: 0.8, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{
                            duration: 0.3,
                            delay: 1.0 + index * 0.05,
                            ease: "backOut",
                          }}
                          whileHover={{
                            scale: 1.05,
                            y: -2,
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                          }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleLanguage(lang)}
                          className={`
                          relative px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                          ${
                            isSelected
                              ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30"
                              : "bg-white text-slate-700 border border-slate-300 hover:border-green-400 hover:bg-green-50"
                          }
                        `}
                        >
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{
                              duration: 0.2,
                              delay: 1.1 + index * 0.05,
                            }}
                            className="relative z-10 block"
                          >
                            {label}
                          </motion.span>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ duration: 0.3, ease: "backOut" }}
                              className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                            >
                              <motion.svg
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.3, delay: 0.1 }}
                                className="w-3 h-3 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={3}
                                  d="M5 13l4 4L19 7"
                                />
                              </motion.svg>
                            </motion.div>
                          )}
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: isSelected ? 1 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-lg"
                          />
                        </motion.button>
                      );
                    }
                  )}
                </motion.div>
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
                  boxShadow: "0 8px 20px -5px rgba(59, 130, 246, 0.4)",
                  backgroundColor: "rgb(37 99 235)",
                }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
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
