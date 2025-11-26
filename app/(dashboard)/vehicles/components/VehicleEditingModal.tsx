"use client";

import { useEffect, useMemo, useState } from "react";
import { DeepPartial, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCurrentEditingVehicleStore } from "../store/useCurrentEditingVehicle";
import api, { Vehicle, VehicleDto, VehicleStatus } from "@/lib/api";
import { useDriverStore } from "../store/useDriversStore";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import { useVehicleStore } from "../store/useVehiclesStore";

// ✅ Vehicle schema
const vehicleSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z
    .string()
    .refine(
      (val) =>
        !isNaN(Number(val)) &&
        Number(val) >= 1900 &&
        Number(val) <= new Date().getFullYear() + 1,
      { message: "Year must be valid" }
    ),
  plateNumber: z.string().min(1, "Plate number is required"),
  vin: z.string().min(1, "VIN is required"),
  status: z.enum(VehicleStatus),
  assignedDriverId: z.string(),
  notes: z.string().optional(),
  nextMaintenanceDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Invalid date",
    }),
  licenseNumber: z.string().min(1, "License number is required"),
  licenseIssueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid license issue date",
  }),
  licenseExpiryDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid license expiry date",
  }),
  insurancePolicyNumber: z.string().optional(),
  insuranceExpiryDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Invalid insurance expiry date",
    }),
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

const formatDateForInput = (date?: string | Date) => {
  if (!date) return "";
  const d = new Date(date);
  // صيغة YYYY-MM-DD المناسبة لـ <input type="date">
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
};

const mapVehicleToFormData = (vehicle?: Vehicle): VehicleFormData => ({
  make: vehicle?.make ?? "",
  model: vehicle?.model ?? "",
  year: vehicle?.year?.toString() ?? "",
  plateNumber: vehicle?.plateNumber ?? "",
  vin: vehicle?.vin ?? "",
  status: vehicle?.status ?? VehicleStatus.ACTIVE,
  assignedDriverId: vehicle?.driver.id ?? "",
  notes: vehicle?.notes ?? undefined,
  nextMaintenanceDate: !!vehicle?.nextMaintenanceDate
    ? formatDateForInput(vehicle?.nextMaintenanceDate)
    : undefined,
  licenseNumber: vehicle?.license.licenseNumber ?? "",
  licenseIssueDate: !!vehicle?.license.issueDate
    ? formatDateForInput(vehicle?.license.issueDate)
    : "",
  licenseExpiryDate: !!vehicle?.license.expiryDate
    ? formatDateForInput(vehicle?.license.expiryDate)
    : "",
  insurancePolicyNumber: vehicle?.license.insurancePolicyNumber ?? "",
  insuranceExpiryDate: !!vehicle?.license.insuranceExpiryDate
    ? formatDateForInput(vehicle?.license.insuranceExpiryDate)
    : undefined,
});

// ✅ Helper to diff vehicle for update
const diffVehicleData = (original: Vehicle, updated: VehicleFormData) => {
  const updateData: DeepPartial<VehicleDto> = {};
  const license: DeepPartial<VehicleDto["license"]> = {};

  if (updated.make !== original.make) updateData.make = updated.make;
  if (updated.model !== original.model) updateData.model = updated.model;
  if (Number(updated.year) !== original.year)
    updateData.year = Number(updated.year);
  if (updated.plateNumber !== original.plateNumber)
    updateData.plateNumber = updated.plateNumber;
  if (updated.vin !== original.vin) updateData.vin = updated.vin;
  if (updated.status !== original.status) updateData.status = updated.status;
  if (updated.assignedDriverId !== original.driver.id)
    updateData.assignedDriverId = updated.assignedDriverId;
  if (updated.notes !== original.notes) updateData.notes = updated.notes;
  if (updated.nextMaintenanceDate !== original.nextMaintenanceDate)
    updateData.nextMaintenanceDate = updated.nextMaintenanceDate
      ? new Date(updated.nextMaintenanceDate).toISOString()
      : undefined;

  // License fields
  if (updated.licenseNumber !== original.license.licenseNumber)
    license.licenseNumber = updated.licenseNumber;
  if (updated.licenseIssueDate !== original.license.issueDate)
    license.licenseIssueDate = updated.licenseIssueDate;
  if (updated.licenseExpiryDate !== original.license.issueDate)
    license.licenseExpiryDate = updated.licenseExpiryDate;
  if (updated.insurancePolicyNumber !== original.license.insurancePolicyNumber)
    license.insurancePolicyNumber = updated.insurancePolicyNumber;
  if (updated.insuranceExpiryDate !== original.license.insuranceExpiryDate)
    license.insuranceExpiryDate = updated.insuranceExpiryDate;

  if (Object.keys(license).length) updateData.license = license;
  return updateData;
};

export default function VehicleEditingModal() {
  const { isEditing, setIsEditing, vehicle, setVehicle } =
    useCurrentEditingVehicleStore();
  const { drivers, setDrivers } = useDriverStore();
  const addToast = useToastStore((state) => state.addToast);
  const [loading, setLoading] = useState(false);
  const { setVehicles } = useVehicleStore();
  useEffect(() => {
    api.DriversService.getAllDrivers().then(setDrivers);
  }, [setDrivers]);

  const driversMap = useMemo(
    () =>
      drivers.map(
        (driver) => [driver.id, driver.user.name] as [string, string]
      ),
    [drivers]
  );

  const refresh = async () => {
    await api.VehiclesService.getAllVehicles().then(setVehicles);
  };

  const statusMap: Record<VehicleStatus, string> = {
    [VehicleStatus.ACTIVE]: "Active",
    [VehicleStatus.IN_MAINTENANCE]: "In Maintenance",
    [VehicleStatus.OUT_OF_SERVICE]: "Out of Service",
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: mapVehicleToFormData(vehicle ?? undefined),
  });

  useEffect(() => {
    reset(mapVehicleToFormData(vehicle ?? undefined));
  }, [vehicle, reset]);

  const onSubmit = async (data: VehicleFormData) => {
    setLoading(true);
    try {
      data = {
        ...data,
        notes: !!data.notes ? data.notes : undefined,
        nextMaintenanceDate: !!data.nextMaintenanceDate
          ? data.nextMaintenanceDate
          : undefined,
        insurancePolicyNumber: !!data.insurancePolicyNumber
          ? data.insurancePolicyNumber
          : undefined,
        insuranceExpiryDate: !!data.insuranceExpiryDate
          ? data.insuranceExpiryDate
          : undefined,
      };

      const {
        licenseNumber,
        licenseExpiryDate,
        licenseIssueDate,
        insuranceExpiryDate,
        insurancePolicyNumber,
        ...restOfData
      } = data;

      data.licenseIssueDate = new Date(data.licenseIssueDate).toISOString();
      data.licenseExpiryDate = new Date(data.licenseIssueDate).toISOString();

      const payload = {
        ...restOfData,
        notes: !!restOfData.notes ? restOfData.notes : undefined,
        nextMaintenanceDate: !!restOfData.nextMaintenanceDate
          ? restOfData.nextMaintenanceDate
          : undefined,
        year: Number(data.year),
        license: {
          licenseNumber: data.licenseNumber,
          licenseIssueDate: new Date(data.licenseIssueDate).toISOString(),
          licenseExpiryDate: new Date(data.licenseExpiryDate).toISOString(),
          insurancePolicyNumber: !!data.insurancePolicyNumber
            ? data.insurancePolicyNumber
            : undefined,
          insuranceExpiryDate: !!data.insuranceExpiryDate
            ? data.insuranceExpiryDate
            : undefined,
        },
      };

      if (!vehicle) {
        await api.VehiclesService.addVehicle(payload);
        await refresh();
        addToast({ message: "Vehicle Added Successfully!", type: "success" });
      } else {
        const updateData = diffVehicleData(vehicle, data);
        await api.VehiclesService.updateVehicle(vehicle.id, updateData);
        await refresh();
        addToast({ message: "Vehicle Updated Successfully!", type: "success" });
      }
      setIsEditing(false);
      setVehicle(null);
      reset();
    } catch (err) {
      addToast({ message: "Error saving vehicle", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (!isEditing) return null;

  return (
    <div className="fixed inset-0 bg-black/50  flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        <h4 className="text-lg font-semibold text-slate-800 mb-4">
          {vehicle ? "Edit Vehicle" : "Add New Vehicle"}
        </h4>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField
              register={register}
              errors={errors}
              name="make"
              placeholder="Make (e.g., Toyota)"
            />
            <InputField
              register={register}
              errors={errors}
              name="model"
              placeholder="Model (e.g., Camry)"
            />
            <InputField
              register={register}
              errors={errors}
              name="year"
              type="number"
              placeholder="Year"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              register={register}
              errors={errors}
              name="plateNumber"
              placeholder="Plate Number"
            />
            <InputField
              register={register}
              errors={errors}
              name="vin"
              placeholder="VIN"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              register={register}
              errors={errors}
              name="status"
              options={Object.values(VehicleStatus).map((v) => [
                v,
                statusMap[v],
              ])}
            />
            <SelectField
              register={register}
              errors={errors}
              name="assignedDriverId"
              options={driversMap}
            />
          </div>

          <InputField
            register={register}
            errors={errors}
            name="nextMaintenanceDate"
            type="date"
            label="Next Maintenance Date"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              register={register}
              errors={errors}
              name="licenseNumber"
              label="License Number"
            />
            <InputField
              register={register}
              errors={errors}
              name="licenseIssueDate"
              label="License Issue Date"
              type="date"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              register={register}
              errors={errors}
              name="licenseExpiryDate"
              label="License Expiry Date"
              type="date"
            />
            <InputField
              register={register}
              errors={errors}
              name="insurancePolicyNumber"
              label="Insurance Policy Number"
            />
          </div>

          <InputField
            register={register}
            errors={errors}
            name="insuranceExpiryDate"
            label="Insurance Expiry Date"
            type="date"
          />

          <div>
            <textarea
              {...register("notes")}
              placeholder="Notes..."
              className="w-full p-2 border rounded-md border-slate-300"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="px-4 py-2 bg-slate-200 rounded-md text-sm font-medium"
              onClick={() => {
                setIsEditing(false);
                setVehicle(null);
                reset();
              }}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ✅ Reusable Input component
function InputField({
  register,
  errors,
  name,
  placeholder,
  type = "text",
  label,
}: any) {
  return (
    <div>
      {label && (
        <label className="text-sm font-medium text-slate-700">{label}</label>
      )}
      <input
        {...register(name)}
        type={type}
        placeholder={placeholder}
        className="w-full mt-1 p-2 border rounded-md border-slate-300"
      />
      {errors[name] && (
        <p className="text-red-600 text-sm">{errors[name]?.message}</p>
      )}
    </div>
  );
}

// ✅ Reusable Select component
function SelectField({ register, errors, name, options }: any) {
  return (
    <div>
      <select
        {...register(name)}
        className="w-full p-2 border rounded-md bg-white border-slate-300"
      >
        {options.map(([value, label]: [string, string]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      {errors[name] && (
        <p className="text-red-600 text-sm">{errors[name]?.message}</p>
      )}
    </div>
  );
}
