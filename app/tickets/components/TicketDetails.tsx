import { Ticket } from "@/lib/api";

export default function TicketDetails({ ticket }: { ticket: Ticket }) {
  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] max-h-[90vh] overflow-y-auto p-4 bg-white rounded-lg shadow-2xl border border-slate-300 z-30 pointer-events-none animate-fade-in">
      <div className="space-y-3 text-sm">
        <h4 className="font-bold text-base text-slate-800 border-b pb-2 mb-2">
          {ticket.subject}
        </h4>
        <p>
          <span className="font-semibold text-slate-600">User:</span>{" "}
          {ticket.guest.name} ({ticket.guest.phone})
        </p>
        <p>
          <span className="font-semibold text-slate-600">Description:</span>{" "}
          <span className="text-slate-700 whitespace-pre-wrap">
            {ticket.description}
          </span>
        </p>
        {/* {ticket.userAttachment && (
          <div>
            <p className="font-semibold text-slate-600 mb-1">
              User Attachment:
            </p>
            <AttachmentPreview attachment={ticket.userAttachment} />
          </div>
        )} */}
        <hr className="my-2" />
        <p className="font-semibold text-slate-600">Admin Reply:</p>
        {ticket.answer ? (
          <p className="text-slate-700 whitespace-pre-wrap">{ticket.answer}</p>
        ) : (
          <p className="text-slate-500 italic">No reply yet.</p>
        )}
        {/* {ticket.adminAttachment && (
          <div>
            <p className="font-semibold text-slate-600 mt-2 mb-1">
              Admin Attachment:
            </p>
            <AttachmentPreview attachment={ticket.adminAttachment} />
          </div>
        )} */}
        {/* {ticket.customerRating && (
          <div className="pt-2 border-t">
            <p className="font-semibold text-slate-600">Customer Rating:</p>
            <div
              className={`inline-flex items-center gap-2 text-sm font-semibold ${
                ticket.customerRating === "satisfied"
                  ? "text-green-800"
                  : "text-red-800"
              }`}
            >
              {ticket.customerRating === "satisfied" ? (
                <ThumbUpIcon className="w-4 h-4" />
              ) : (
                <ThumbDownIcon className="w-4 h-4" />
              )}
              <span className="capitalize">{ticket.customerRating}</span>
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
}
