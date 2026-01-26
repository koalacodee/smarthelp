"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import { useCurrentEditingTicketStore } from "../store/useCurrentReplyingTicket";
import api, { TicketStatus } from "@/lib/api";
import { useEffect, useState } from "react";
import { useTicketStore } from "../store/useTicketStore";
import useFormErrors from "@/hooks/useFormErrors";
import AttachmentInput from "../../files/components/v3/AttachmentInput";
import { useAttachments } from "@/hooks/useAttachments";
import ExistingAttachmentsViewer from "../../files/components/ExistingAttachmentsViewer";
import { useLocaleStore } from "@/lib/store/useLocaleStore";

export default function ReplyToTicketModal() {
  const { clearErrors, setErrors, setRootError, errors } = useFormErrors([
    "answer",
  ]);
  const { ticket, setTicket } = useCurrentEditingTicketStore();
  const { addToast } = useToastStore();
  const { updateStatus } = useTicketStore();
  const [answer, setAnswer] = useState("");
  const [fileHubUploadKey, setFileHubUploadKey] = useState<string | null>(null);
  const [selectedAttachments, setSelectedAttachments] = useState<Set<string>>(
    new Set()
  );
  const [attach, setAttach] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [hasStartedUpload, setHasStartedUpload] = useState(false);
  const [isWaitingToClose, setIsWaitingToClose] = useState(false);
  const { moveCurrentNewTargetSelectionsToExisting, reset } = useAttachments();
  const { locale } = useLocaleStore();

  const handleClose = () => {
    setTicket(null);
    setIsWaitingToClose(false);
    setHasStartedUpload(false);
    setFileHubUploadKey(null);
    setSelectedAttachments(new Set());
    setAttach(false);
    reset();
  };

  useEffect(() => {
    if (hasStartedUpload && !isUploading && isWaitingToClose) {
      handleClose();
    }
  }, [hasStartedUpload, isUploading, isWaitingToClose]);

  if (!locale) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLButtonElement>) => {
    if (!ticket) return;
    e.preventDefault();
    clearErrors();

    if (!answer.trim()) {
      setRootError(locale.tickets.modal.replyPlaceholder || "Please provide a reply message.");
      return;
    }

    try {
      const { fileHubUploadKey, answer: savedAnswer } =
        await api.TicketsService.answerTicket(
          ticket.id,
          {
            content: answer,
            chooseAttachments: Array.from(selectedAttachments),
          },
          attach
        );
      setFileHubUploadKey(fileHubUploadKey ?? null);
      if (selectedAttachments.size > 0) {
        moveCurrentNewTargetSelectionsToExisting(savedAnswer.id);
      }
      addToast({
        message: locale.tickets.toasts.ticketReplied,
        type: "success",
      });

      // Mark ticket as answered immediately after a successful reply,
      // regardless of whether there are pending FileHub uploads.
      updateStatus(ticket.id, TicketStatus.ANSWERED);

      if (attach) {
        setIsWaitingToClose(true);
      } else {
        handleClose();
      }
    } catch (error: any) {
      if (error?.response?.data?.data?.details) {
        setErrors(error?.response?.data?.data?.details);
      } else {
        setRootError(
          error?.response?.data?.message ||
          locale.tickets.toasts.replyError
        );
      }
    }
  };

  const isTicketClosedOrAnswered =
    ticket?.status === TicketStatus.CLOSED ||
    ticket?.status === TicketStatus.ANSWERED;
  return (
    <AnimatePresence>
      {ticket && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black/50  flex items-center justify-center z-50 p-4"
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
              {locale.tickets.modal.title.replace("{subject}", ticket.subject)}
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
                    {locale.tickets.modal.customer}
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
                    {locale.tickets.modal.phone}
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
                  {locale.tickets.modal.subDepartment}
                </p>
                <p className="p-3 bg-slate-50 rounded-xl text-slate-800 border border-slate-200">
                  {ticket.department?.name || locale.tickets.list.unknown}
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
              >
                <p className="font-semibold text-sm text-slate-600 mb-2">
                  {locale.tickets.modal.subject}
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
                  {locale.tickets.modal.description}
                </p>
                <p className="p-3 bg-slate-50 rounded-xl text-slate-800 border border-slate-200 whitespace-pre-wrap">
                  {ticket.description}
                </p>
              </motion.div>
              <ExistingAttachmentsViewer
                targetId={ticket.id}
                title={locale.tickets.modal.attachmentsTitle}
              />
            </motion.div>
            {isTicketClosedOrAnswered ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.8 }}
                className="space-y-6"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.9 }}
                >
                  <p className="font-semibold text-sm text-slate-600 mb-2">
                    {locale.tickets.modal.reply}
                  </p>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 1 }}
                    className="p-3 bg-slate-50 rounded-xl text-slate-800 border border-slate-200 whitespace-pre-wrap"
                  >
                    {ticket.answer?.content || locale.tickets.modal.noReply}
                  </motion.div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 1.1 }}
                  className="flex justify-end"
                >
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 1.2 }}
                    whileHover={{
                      scale: 1.05,
                      backgroundColor: "rgb(148 163 184)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-slate-200 rounded-xl text-sm font-medium hover:bg-slate-300 transition-all duration-200 shadow-lg hover:shadow-xl"
                    onClick={() => setTicket(null)}
                  >
                    {locale.tickets.modal.close}
                  </motion.button>
                </motion.div>
              </motion.div>
            ) : (
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
                      placeholder={locale.tickets.modal.replyPlaceholder}
                      defaultValue={ticket.answer?.content || ""}
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
                      uploadKey={fileHubUploadKey ?? undefined}
                      uploadWhenKeyProvided={true}
                      onSelectedAttachmentsChange={setSelectedAttachments}
                      onHasFilesToUpload={setAttach}
                      onUploadStart={() => {
                        setHasStartedUpload(true);
                        setIsUploading(true);
                      }}
                      onUploadEnd={() => setIsUploading(false)}
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
                      transition={{
                        duration: 0.3,
                        delay: 1.3,
                        ease: "backOut",
                      }}
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
                        {locale.tickets.modal.promoteToFaq}
                      </label>
                      <p className="text-xs text-slate-500">
                        {locale.tickets.modal.promoteHint}
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
                    {locale.tickets.modal.cancel}
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
                    {locale.tickets.modal.sendReply}
                  </motion.button>
                </motion.div>
              </motion.form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
