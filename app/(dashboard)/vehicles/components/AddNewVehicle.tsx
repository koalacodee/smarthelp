"use client";

import { useCurrentEditingVehicleStore } from "../store/useCurrentEditingVehicle";

export default function AddNewVehicle() {
  const { setIsEditing } = useCurrentEditingVehicleStore();

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={() => {
          setIsEditing(true);
        }}
        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200"
      >
        Add New Vehicle
      </button>
    </div>
  );
}
