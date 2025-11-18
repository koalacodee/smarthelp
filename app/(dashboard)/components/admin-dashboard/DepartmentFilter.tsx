"use client";

interface Department {
  id: string;
  name: string;
}

interface DepartmentFilterProps {
  departments: Department[];
  selectedDepartment: string;
  onChange: (departmentId: string) => void;
  onApply: () => void;
  isLoading?: boolean;
  className?: string;
}

export default function DepartmentFilter({
  departments,
  selectedDepartment,
  onChange,
  onApply,
  isLoading = false,
  className = "",
}: DepartmentFilterProps) {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    onChange(value);
  };

  return (
    <div className={`w-full max-w-md ${className}`.trim()}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-4">
        <div className="flex-1">
          <label
            htmlFor="admin-dashboard-department-filter"
            className="block text-sm font-medium text-slate-600 mb-2"
          >
            Department
          </label>
          <div className="relative">
            <select
              id="admin-dashboard-department-filter"
              value={selectedDepartment}
              onChange={handleChange}
              className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-medium text-slate-700 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">All departments</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onApply}
          disabled={isLoading}
          className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
        >
          {isLoading ? "Applying..." : "Apply Filter"}
        </button>
      </div>
    </div>
  );
}

