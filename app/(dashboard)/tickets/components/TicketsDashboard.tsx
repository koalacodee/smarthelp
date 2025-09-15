import { TicketMetrics } from "@/lib/api";

export default function TicketsDashboard({
  totalTickets,
  pendingTickets,
  answeredTickets,
  closedTickets,
}: TicketMetrics) {
  const completionPercentage =
    totalTickets > 0 ? Math.round((closedTickets / totalTickets) * 100) : 0;

  return (
    <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] p-5 mb-5">
      <h3 className="text-base font-semibold mb-4 text-[#4a5568]">Dashboard</h3>
      <div
        className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 relative`}
        style={{
          background: `conic-gradient(
      #3b82f6 0deg ${completionPercentage * 3.6}deg, 
      #e2e8f0 ${completionPercentage * 3.6}deg 360deg
    )`,
        }}
      >
        <span className="text-lg font-bold bg-white rounded-full w-16 h-16 flex items-center justify-center">
          {completionPercentage}%
        </span>
      </div>

      <ul className="list-none">
        <li className="flex justify-between py-2.5 border-b border-[#e2e8f0] text-sm">
          <span>
            <span className="mr-1.5">🎫</span> Total Tickets
          </span>
          <span className="text-[#667eea]">{totalTickets}</span>
        </li>
        <li className="flex justify-between py-2.5 border-b border-[#e2e8f0] text-sm">
          <span>
            <span className="mr-1.5">⏳</span> Pending
          </span>
          <span className="text-[#f59e0b]">{pendingTickets}</span>
        </li>
        <li className="flex justify-between py-2.5 border-b border-[#e2e8f0] text-sm">
          <span>
            <span className="mr-1.5">✅</span> Answered
          </span>
          <span className="text-[#48bb78]">{answeredTickets}</span>
        </li>
        <li className="flex justify-between py-2.5 text-sm">
          <span>
            <span className="mr-1.5">🔒</span> Closed
          </span>
          <span className="text-[#6b7280]">{closedTickets}</span>
        </li>
      </ul>
    </div>
  );
}
