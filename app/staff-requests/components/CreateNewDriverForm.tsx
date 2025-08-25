"use client";
import { useState } from "react";
import api from "@/lib/api";
import { useToastStore } from "@/app/store/useToastStore";

export default function CreateNewDriverForm() {
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    temporaryPassword: "",
    employeeId: "",
    jobTitle: "Driver",
    licensingNumber: "",
    drivingLicenseExpiry: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToastStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.username ||
      !formData.name ||
      !formData.email ||
      !formData.temporaryPassword ||
      !formData.licensingNumber ||
      !formData.drivingLicenseExpiry
    ) {
      addToast({ message: "All fields are required", type: "error" });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.DriversService.createDriver({
        username: formData.username,
        name: formData.name,
        email: formData.email,
        temporaryPassword: formData.temporaryPassword,
        employeeId: formData.employeeId,
        jobTitle: formData.jobTitle,
        licensingNumber: formData.licensingNumber,
        drivingLicenseExpiry: new Date(formData.drivingLicenseExpiry),
      });

      addToast({ message: "Driver created successfully", type: "success" });

      // Reset form
      setFormData({
        username: "",
        name: "",
        email: "",
        temporaryPassword: "",
        employeeId: "",
        jobTitle: "Driver",
        licensingNumber: "",
        drivingLicenseExpiry: "",
      });
    } catch (error) {
      addToast({ message: "Failed to create driver", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">
            Username *
          </label>
          <input
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            type="text"
            placeholder="johndoe"
          />
        </div>
        <div>
          <label htmlFor="temporaryPassword" className="block text-sm font-medium text-slate-700 mb-1">
            Temporary Password *
          </label>
          <input
            id="temporaryPassword"
            name="temporaryPassword"
            value={formData.temporaryPassword}
            onChange={handleChange}
            required
            className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            type="password"
            placeholder="Secure temporary password"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
            Full Name *
          </label>
          <input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            type="text"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
            Email Address *
          </label>
          <input
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            type="email"
            placeholder="john.doe@company.com"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="employeeId" className="block text-sm font-medium text-slate-700 mb-1">
            Employee ID
          </label>
          <input
            id="employeeId"
            name="employeeId"
            value={formData.employeeId}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            type="text"
            placeholder="EMP001"
          />
        </div>
        <div>
          <label htmlFor="jobTitle" className="block text-sm font-medium text-slate-700 mb-1">
            Job Title
          </label>
          <input
            id="jobTitle"
            name="jobTitle"
            value={formData.jobTitle}
            onChange={handleChange}
            required
            className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            type="text"
            placeholder="Driver"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="licensingNumber" className="block text-sm font-medium text-slate-700 mb-1">
            Driving License Number *
          </label>
          <input
            id="licensingNumber"
            name="licensingNumber"
            value={formData.licensingNumber}
            onChange={handleChange}
            required
            className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            type="text"
            placeholder="DL123456789"
          />
        </div>
        <div>
          <label htmlFor="drivingLicenseExpiry" className="block text-sm font-medium text-slate-700 mb-1">
            License Expiry Date *
          </label>
          <input
            id="drivingLicenseExpiry"
            name="drivingLicenseExpiry"
            value={formData.drivingLicenseExpiry}
            onChange={handleChange}
            required
            className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            type="date"
          />
        </div>
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Creating..." : "Add Driver"}
        </button>
      </div>
    </form>
  );
}
