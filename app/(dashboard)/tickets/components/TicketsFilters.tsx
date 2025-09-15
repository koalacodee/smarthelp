import { TicketStatus } from "@/lib/api";

export default function TicketsFilters() {
  return (
    <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] p-5">
      <h3 className="text-base font-semibold mb-4 text-[#4a5568]">
        Filters &amp; Search
      </h3>
      <input
        type="text"
        className="w-full px-3 py-2.5 border border-[#e2e8f0] rounded-md text-sm placeholder:text-[#9ca3af] focus:outline-none focus:border-[#3b82f6]"
        placeholder="Search tickets..."
      />
      <div className="mt-5">
        <label className="block mb-1 text-xs text-[#4a5568]">Status</label>
        <select className="w-full px-3 py-2.5 border border-[#e2e8f0] rounded-md text-sm bg-[#f7fafc] focus:outline-none focus:border-[#3b82f6]">
          <option value="">All</option>
          <option value={TicketStatus.NEW}>New</option>
          <option value={TicketStatus.SEEN}>Seen</option>
          <option value={TicketStatus.ANSWERED}>Answered</option>
          <option value={TicketStatus.CLOSED}>Closed</option>
        </select>
        <label className="block mb-1 mt-4 text-xs text-[#4a5568]">
          Category
        </label>
        <select className="w-full px-3 py-2.5 border border-[#e2e8f0] rounded-md text-sm bg-[#f7fafc] focus:outline-none focus:border-[#3b82f6]">
          <option value="">All Categories</option>
          <option value="technical">Technical Support</option>
          <option value="billing">Billing</option>
          <option value="general">General Inquiry</option>
          <option value="complaint">Complaint</option>
          <option value="feature-request">Feature Request</option>
        </select>
      </div>
    </div>
  );
}
