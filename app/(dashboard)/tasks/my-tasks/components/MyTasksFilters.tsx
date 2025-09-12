export default function MyTasksFilters() {
  return (
    <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] p-5">
      <h3 className="text-base font-semibold mb-4 text-[#4a5568]">
        Filters &amp; Search
      </h3>
      <input
        type="text"
        className="w-full px-3 py-2.5 border border-[#e2e8f0] rounded-md text-sm placeholder:text-[#9ca3af] focus:outline-none focus:border-[#3b82f6]"
        placeholder="Search tasks..."
      />
      <div className="mt-5">
        <label className="block mb-1 text-xs text-[#4a5568]">Status</label>
        <select className="w-full px-3 py-2.5 border border-[#e2e8f0] rounded-md text-sm bg-[#f7fafc] focus:outline-none focus:border-[#3b82f6]">
          <option>All</option>
          <option>Completed</option>
          <option>In Progress</option>
        </select>
        <label className="block mb-1 mt-4 text-xs text-[#4a5568]">
          Priority
        </label>
        <select className="w-full px-3 py-2.5 border border-[#e2e8f0] rounded-md text-sm bg-[#f7fafc] focus:outline-none focus:border-[#3b82f6]">
          <option>All</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
        <label className="block mb-1 mt-4 text-xs text-[#4a5568]">
          Category
        </label>
        <select className="w-full px-3 py-2.5 border border-[#e2e8f0] rounded-md text-sm bg-[#f7fafc] focus:outline-none focus:border-[#3b82f6]">
          <option>All</option>
          <option>Work</option>
          <option>Personal</option>
          <option>Study</option>
        </select>
      </div>
    </div>
  );
}
