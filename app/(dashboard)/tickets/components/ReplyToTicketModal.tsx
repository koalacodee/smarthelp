"use client";
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
    <>
      {ticket && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <h3 className="text-xl font-bold mb-4">
              Ticket Details # {ticket.subject}
            </h3>
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold text-sm text-slate-600">
                    Customer:
                  </p>
                  <p className="p-2 bg-slate-100 rounded text-slate-800">
                    {ticket.guestName}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-600">Phone:</p>
                  <p className="p-2 bg-slate-100 rounded text-slate-800">
                    {ticket.guestPhone}
                  </p>
                </div>
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-600">
                  Sub-department:
                </p>
                <p className="p-2 bg-slate-100 rounded text-slate-800">
                  Domestic Shipping
                </p>
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-600">Subject:</p>
                <p className="p-2 bg-slate-100 rounded text-slate-800">
                  {ticket.subject}
                </p>
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-600">
                  Description:
                </p>
                <p className="p-2 bg-slate-100 rounded text-slate-800 whitespace-pre-wrap">
                  {ticket.description}
                </p>
              </div>
            </div>
            <form>
              <div className="space-y-4">
                <textarea
                  rows={5}
                  className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Write your reply..."
                  defaultValue={ticket.answer || ""}
                  onChange={(e) => setAnswer(e.target.value)}
                />
                <AttachmentInput
                  id="admin-reply-attachment"
                  onAttachmentsChange={setAttachments}
                />
                <div className="mt-4 flex items-start gap-4">
                  <div className="flex items-center h-5 pt-0.5">
                    <input
                      id="promote"
                      className="h-4 w-4 text-blue-600 border-slate-300 rounded-md focus:ring-blue-500"
                      type="checkbox"
                    />
                  </div>
                  <div className="text-sm flex-1">
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
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-4">
                <button
                  type="button"
                  className="px-4 py-2 bg-slate-200 rounded-md text-sm font-medium hover:bg-slate-300"
                  onClick={() => setTicket(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                  onClick={handleSubmit}
                >
                  Send Reply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
