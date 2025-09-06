"use client";

import { useCurrentEditingVehicleStore } from "../store/useCurrentEditingVehicle";

export default function AddNewVehicle() {
  const { setIsEditing } = useCurrentEditingVehicleStore();

  return (
    <button
      onClick={() => {
        setIsEditing(true);
      }}
      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
    >
      Add New Vehicle
    </button>
  );
}
