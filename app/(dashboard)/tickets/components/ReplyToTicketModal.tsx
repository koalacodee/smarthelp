"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import { useCurrentEditingTicketStore } from "../store/useCurrentReplyingTicket";
import api, { TicketStatus } from "@/lib/api";
import { useState } from "react";
import { useTicketStore } from "../store/useTicketStore";
import AttachmentInput from "@/components/ui/AttachmentInput";
import {
  Attachment,
  useAttachmentStore,
} from "@/app/(dashboard)/store/useAttachmentStore";

export default function ReplyToTicketModal() {
  const { ticket, setTicket } = useCurrentEditingTicketStore();
  const { addToast } = useToastStore();
  const { updateStatus } = useTicketStore();
  const [answer, setAnswer] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const { getFormData } = useAttachmentStore();

  const handleSubmit = async (e: React.FormEvent<HTMLButtonElement>) => {
    if (!ticket) return;
    e.preventDefault();
    try {
      // Get FormData from attachment store
      const formData = attachments.length > 0 ? getFormData() : undefined;

      await api.TicketsService.answerTicket(
        ticket.id,
        {
          content: answer,
        },
        formData
      );
      setTicket(null);
      addToast({
        message: "Ticket has been replied successfully.",
        type: "success",
      });
      updateStatus(ticket.id, TicketStatus.ANSWERED);
    } catch (error) {
      addToast({
        message: "Failed to reply to ticket.",
        type: "error",
      });
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
