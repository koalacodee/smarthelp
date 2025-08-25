import { Vehicle } from "@/lib/api";
import { useCurrentEditingVehicleStore } from "../store/useCurrentEditingVehicle";
import { useConfirmationModalStore } from "@/app/store/useConfirmationStore";
import api from "@/lib/api";
import { useVehicleStore } from "../store/useVehiclesStore";
import { useToastStore } from "@/app/store/useToastStore";

export default function VehicleActions({ vehicle }: { vehicle: Vehicle }) {
  const { setIsEditing, setVehicle } = useCurrentEditingVehicleStore();
  const { addToast } = useToastStore();
  const { removeVehicle } = useVehicleStore();
  const { openModal } = useConfirmationModalStore();

  return (
    <>
      <button
        onClick={() =>
          openModal({
            title: "Confirm Deletion",
            message: "Are you sure you want to delete this vehicle?",
            confirmText: "Yes, Delete",
            cancelText: "Cancel",
            onConfirm: () => {
              api.VehiclesService.deleteVehicle(vehicle.id).then(() => {
                setIsEditing(false);
                setVehicle(null);
                removeVehicle(vehicle.id);
                addToast({
                  message: "Vehicle Deleted Successfully!",
                  type: "success",
                });
              });
            },
          })
        }
        className="text-red-600 hover:text-red-800 font-medium text-sm"
      >
        Delete
      </button>
      <button
        onClick={() => {
          setIsEditing(true);
          setVehicle(vehicle);
        }}
        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
      >
        Edit
      </button>
    </>
  );
}
