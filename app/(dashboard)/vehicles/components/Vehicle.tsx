import { Vehicle as VehicleInterface } from "@/lib/api";
import VehicleActions from "./VehicleActions";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import { formatDateWithHijri } from "@/locales/dateFormatter";

export default function Vehicle({ vehicle }: { vehicle: VehicleInterface }) {
  const language = useLocaleStore((state) => state.language);
  const getStatusBadgeColor = (status: VehicleInterface["status"]) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "IN_MAINTENANCE":
        return "bg-yellow-100 text-yellow-800";
      case "OUT_OF_SERVICE":
        return "bg-red-100 text-red-800";
    }
  };

  return (
    <div className="rounded-lg shadow-sm overflow-hidden flex flex-col">
      <div className="h-48 bg-slate-200">
        <div className="w-full h-full flex items-center justify-center text-slate-400">
          No Image
        </div>
      </div>
      <div className="p-4 flex-grow flex flex-col">
        <div className="flex justify-between items-start">
          <h4 className="text-lg font-bold text-slate-900">
            {vehicle.make} {vehicle.model}
          </h4>
          <span
            className={`px-2 capitalize py-0.5 text-xs font-semibold rounded-full ${getStatusBadgeColor(
              vehicle.status
            )}`}
          >
            {vehicle.status.toLowerCase()}
          </span>
        </div>
        <p className="text-sm text-slate-500">
          {vehicle.year} · {vehicle.plateNumber}
        </p>
        <p className="text-xs text-slate-400 mt-1">VIN: {vehicle.vin}</p>
        <div className="mt-4 flex-grow">
          <p className="text-sm">
            <span className="font-semibold">Driver:</span>{" "}
            {vehicle.driver.user.name}
          </p>
          {vehicle.nextMaintenanceDate && (
            <p className="text-sm mt-1">
              <span className="font-semibold">Maintenance Due:</span>{" "}
              {formatDateWithHijri(vehicle.nextMaintenanceDate, language)}
            </p>
          )}
          {vehicle.notes && (
            <p className="text-sm mt-2">
              <span className="font-semibold">Notes:</span> {vehicle.notes}
            </p>
          )}
        </div>
        <div className="mt-4 pt-4 border-t border-slate-200 flex justify-end gap-3">
          <VehicleActions vehicle={vehicle} />
        </div>
      </div>
    </div>
  );
}
