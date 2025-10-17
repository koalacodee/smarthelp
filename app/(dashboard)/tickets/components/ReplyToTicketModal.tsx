"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import { useCurrentEditingTicketStore } from "../store/useCurrentReplyingTicket";
import api, { TicketStatus } from "@/lib/api";
import { useEffect, useState } from "react";
import { useTicketStore } from "../store/useTicketStore";
import AttachmentInput from "@/components/ui/AttachmentInput";
import {
  Attachment,
  useAttachmentStore,
} from "@/app/(dashboard)/store/useAttachmentStore";
import useFormErrors from "@/hooks/useFormErrors";
import { useAttachmentsStore } from "@/lib/store/useAttachmentsStore";
import { UploadService } from "@/lib/api/v2";
import { GetAttachmentMetadataResponse } from "@/lib/api/v2/services/shared/upload";
import { useMediaPreviewStore } from "../../store/useMediaPreviewStore";

const isExpired = (expirationDate?: Date) => {
  if (!expirationDate) return false;
  return new Date() > expirationDate;
};

interface TicketAttachment extends GetAttachmentMetadataResponse {
  id: string;
}

export default function ReplyToTicketModal() {
  const { clearErrors, setErrors, setRootError, errors } = useFormErrors([
    "answer",
  ]);
  const { ticket, setTicket } = useCurrentEditingTicketStore();
  const { addToast } = useToastStore();
  const { updateStatus } = useTicketStore();
  const [answer, setAnswer] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const {
    getFormData,
    selectedAttachmentIds,
    moveAllSelectedToExisting,
    clearAttachments,
  } = useAttachmentStore();
  const { attachments: ticketsAttachments } = useAttachmentsStore();

  const [ticketAttachments, setTicketAttachments] = useState<
    TicketAttachment[]
  >([]);

  const { openPreview } = useMediaPreviewStore();

  const handlePreviewExistingAttachment = (attachment: TicketAttachment) => {
    openPreview({
      originalName: attachment.originalName,
      tokenOrId: attachment.id,
      fileType: attachment.fileType,
      sizeInBytes: attachment.sizeInBytes,
      expiryDate: attachment.expiryDate || "",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  useEffect(() => {
    (async () => {
      if (!ticket?.id) return;
      const attachments = ticketsAttachments.ticket[ticket.id] ?? [];
      const promises = attachments.map(async (attachment) => {
        const data = await UploadService.getAttachmentMetadata({
          tokenOrId: attachment,
        });

        return {
          id: attachment,
          ...data,
        };
      });
      const results = await Promise.all(promises);
      setTicketAttachments(results);
    })();
  }, [ticketsAttachments, ticket?.id]);

  const handleSubmit = async (e: React.FormEvent<HTMLButtonElement>) => {
    if (!ticket) return;
    e.preventDefault();
    clearErrors();

    if (!answer.trim()) {
      setRootError("Please provide a reply message.");
      return;
    }

    try {
      // Get FormData from attachment store
      const formData = attachments.length > 0 ? getFormData() : undefined;

      await api.TicketsService.answerTicket(
        ticket.id,
        {
          content: answer,
          chooseAttachments: Array.from(selectedAttachmentIds),
        },
        formData
      );
      setTicket(null);
      addToast({
        message: "Ticket has been replied successfully.",
        type: "success",
      });
      updateStatus(ticket.id, TicketStatus.ANSWERED);
      moveAllSelectedToExisting();
      clearAttachments();
    } catch (error: any) {
      console.error("Reply to ticket error:", error);
      console.log("Reply to ticket error:", error);
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
            "Failed to reply to ticket. Please try again."
        );
      }
    }
  };
  return (
    <AnimatePresence>
      {ticket && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setTicket(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.h3
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-2xl font-bold mb-6 bg-gradient-to-r from-slate-800 to-blue-800 bg-clip-text text-transparent"
            >
              Ticket Details #{ticket.subject}
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
              className="space-y-6 mb-6"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-6"
              >
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  <p className="font-semibold text-sm text-slate-600 mb-2">
                    Customer:
                  </p>
                  <p className="p-3 bg-slate-50 rounded-xl text-slate-800 border border-slate-200">
                    {ticket.guestName}
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  <p className="font-semibold text-sm text-slate-600 mb-2">
                    Phone:
                  </p>
                  <p className="p-3 bg-slate-50 rounded-xl text-slate-800 border border-slate-200">
                    {ticket.guestPhone}
                  </p>
                </motion.div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                <p className="font-semibold text-sm text-slate-600 mb-2">
                  Sub-department:
                </p>
                <p className="p-3 bg-slate-50 rounded-xl text-slate-800 border border-slate-200">
                  Domestic Shipping
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
              >
                <p className="font-semibold text-sm text-slate-600 mb-2">
                  Subject:
                </p>
                <p className="p-3 bg-slate-50 rounded-xl text-slate-800 border border-slate-200">
                  {ticket.subject}
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.7 }}
              >
                <p className="font-semibold text-sm text-slate-600 mb-2">
                  Description:
                </p>
                <p className="p-3 bg-slate-50 rounded-xl text-slate-800 border border-slate-200 whitespace-pre-wrap">
                  {ticket.description}
                </p>
              </motion.div>
              {ticketAttachments.length > 0 && (
                <motion.div
                  className="mt-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.75 }}
                >
                  <h4 className="text-sm font-medium text-slate-700 mb-2">
                    Existing Attachments
                  </h4>
                  <motion.div
                    className="space-y-2"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: {},
                      visible: {
                        transition: {
                          staggerChildren: 0.07,
                        },
                      },
                    }}
                  >
                    {ticketAttachments.map((attachment, idx) => (
                      <motion.div
                        key={`existing-${attachment.id}`}
                        className={`flex items-center justify-between p-3 rounded-md border cursor-pointer hover:shadow-md transition-all ${
                          attachment.expiryDate &&
                          isExpired(new Date(attachment.expiryDate))
                            ? "bg-red-50 border-red-200 hover:bg-red-100"
                            : "bg-blue-50 border-blue-200 hover:bg-blue-100"
                        }`}
                        onClick={() =>
                          handlePreviewExistingAttachment(attachment)
                        }
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.01 * idx }}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {attachment.originalName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatFileSize(attachment.sizeInBytes)} •{" "}
                            {attachment.expiryDate ? (
                              <>
                                {" • Expires: "}
                                {new Date(
                                  attachment.expiryDate
                                ).toLocaleString()}
                                {isExpired(new Date(attachment.expiryDate)) && (
                                  <span className="text-red-600 font-medium ml-1">
                                    (EXPIRED)
                                  </span>
                                )}
                              </>
                            ) : (
                              " • No expiration"
                            )}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.8 }}
            >
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.9 }}
                >
                  <motion.textarea
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 1 }}
                    whileFocus={{
                      scale: 1.02,
                      boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
                    }}
                    rows={5}
                    className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-slate-50/50 resize-none"
                    placeholder="Write your reply..."
                    defaultValue={ticket.answer || ""}
                    onChange={(e) => setAnswer(e.target.value)}
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
                  transition={{ duration: 0.4, delay: 1.1 }}
                >
                  <AttachmentInput
                    id="admin-reply-attachment"
                    onAttachmentsChange={setAttachments}
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 1.2 }}
                  className="mt-4 flex items-start gap-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 1.3, ease: "backOut" }}
                    className="flex items-center h-5 pt-0.5"
                  >
                    <input
                      id="promote"
                      className="h-4 w-4 text-blue-600 border-slate-300 rounded-md focus:ring-blue-500"
                      type="checkbox"
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 1.4 }}
                    className="text-sm flex-1"
                  >
                    <label
                      htmlFor="promote"
                      className="font-medium text-slate-900"
                    >
                      Promote to public FAQ
                    </label>
                    <p className="text-xs text-slate-500">
                      The ticket subject will be the question, and your reply
                      will be the answer.
                    </p>
                  </motion.div>
                </motion.div>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 1.5 }}
                className="mt-8 flex justify-end gap-4"
              >
                <motion.button
                  type="button"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 1.6 }}
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: "rgb(148 163 184)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-slate-200 rounded-xl text-sm font-medium hover:bg-slate-300 transition-all duration-200 shadow-lg hover:shadow-xl"
                  onClick={() => setTicket(null)}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 1.7 }}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 8px 20px -5px rgba(59, 130, 246, 0.4)",
                    backgroundColor: "rgb(37 99 235)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  onClick={handleSubmit}
                >
                  Send Reply
                </motion.button>
              </motion.div>
            </motion.form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
