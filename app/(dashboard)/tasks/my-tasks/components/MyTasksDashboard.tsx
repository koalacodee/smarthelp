export default function MyTasksDashboard({
  total,
  completedTasks,
  pendingTasks,
  taskCompletionPercentage,
}: {
  total: number;
  completedTasks: number;
  pendingTasks: number;
  taskCompletionPercentage: number;
}) {
  return (
    <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] p-5">
      <h3 className="text-base font-semibold mb-4 text-[#4a5568]">Dashboard</h3>
      <div
        className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 relative`}
        style={{
          background: `conic-gradient(
      #3b82f6 0deg ${taskCompletionPercentage * 3.6}deg, 
      #e2e8f0 ${taskCompletionPercentage * 3.6}deg 360deg
    )`,
        }}
      >
        <span className="text-lg font-bold bg-white rounded-full w-16 h-16 flex items-center justify-center">
          {taskCompletionPercentage}%
        </span>
      </div>

      <ul className="list-none">
        <li className="flex justify-between py-2.5 border-b border-[#e2e8f0] text-sm">
          <span>
            <span className="mr-1.5">📋</span> Total Tasks
          </span>
          <span className="text-[#667eea]">{total}</span>
        </li>
        <li className="flex justify-between py-2.5 border-b border-[#e2e8f0] text-sm">
          <span>
            <span className="mr-1.5">✅</span> Completed
          </span>
          <span className="text-[#48bb78]">{completedTasks}</span>
        </li>
        <li className="flex justify-between py-2.5 text-sm">
          <span>
            <span className="mr-1.5">🟡</span> In Progress
          </span>
          <span className="text-[#f59e0b]">{pendingTasks}</span>
        </li>
      </ul>
    </div>
  );
}
