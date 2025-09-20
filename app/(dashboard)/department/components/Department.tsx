import { Department as DepartmentType } from "@/lib/api/departments";
import EyeIcon from "@/icons/Eye";
import EyeSlashIcon from "@/icons/EyeSlash";
import DepartmentActions from "./DepartmentActions";

interface DepartmentProps {
  department: DepartmentType;
}

export default function Department({ department }: DepartmentProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="font-semibold text-slate-800">{department.name}</h4>
          <div className="mt-2 flex items-center gap-2">
            {department.visibility === "PUBLIC" ? (
              <>
                <EyeIcon className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                  Public
                </span>
              </>
            ) : (
              <>
                <EyeSlashIcon className="w-4 h-4 text-slate-600" />
                <span className="text-xs text-slate-700 bg-slate-200 px-2 py-0.5 rounded-full">
                  Private
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DepartmentActions department={department} />
        </div>
      </div>
    </div>
  );
}
