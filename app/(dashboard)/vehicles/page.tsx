import { Metadata } from "next";
import api from "@/lib/api";
import VehiclesContainer from "./components/VehiclesContainer";
import AddNewVehicle from "./components/AddNewVehicle";
import VehicleEditingModal from "./components/VehicleEditingModal";

export const metadata: Metadata = {
  title: "Vehicles | Fleet Management",
  description:
    "Manage vehicle fleet, track vehicle information, and monitor fleet operations",
};

export default async function Page() {
  const vehicles = await api.VehiclesService.getAllVehicles();

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-800">Vehicle Fleet</h3>
          <AddNewVehicle />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <VehiclesContainer vehicles={vehicles} />
        </div>
      </div>
      <VehicleEditingModal />
    </>
  );
}
