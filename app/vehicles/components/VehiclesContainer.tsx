"use client";

import { Vehicle } from "@/lib/api";
import { useVehicleStore } from "../store/useVehiclesStore";
import { useEffect } from "react";
import VehicleComponent from "./Vehicle";

export default function VehiclesContainer({
  vehicles,
}: {
  vehicles: Vehicle[];
}) {
  const { setVehicles, vehicles: storedVehicles } = useVehicleStore();

  useEffect(() => {
    setVehicles(vehicles);
  }, []);

  return (
    <>
      {storedVehicles.map((vehicle) => (
        <VehicleComponent key={vehicle.id} vehicle={vehicle} />
      ))}
    </>
  );
}
