"use client";
import { useState } from "react";
import { useEmployeeRequestsStore } from "@/app/(dashboard)/store/useEmployeeRequestsStore";
import api from "@/lib/api";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";

export default function SubmitEmployeeRequestForm() {
  const [formData, setFormData] = useState({
    newEmployeeUsername: "",
    newEmployeeEmail: "",
    newEmployeeFullName: "",
    newEmployeeJobTitle: "",
    temporaryPassword: "",
    newEmployeeId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addRequest } = useEmployeeRequestsStore();
  const { addToast } = useToastStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.newEmployeeUsername ||
      !formData.newEmployeeEmail ||
      !formData.newEmployeeFullName ||
      !formData.newEmployeeJobTitle ||
      !formData.temporaryPassword ||
      !formData.newEmployeeId
    ) {
      addToast({ message: "All fields are required", type: "error" });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.EmployeeRequestsService.submitEmployeeRequest({
        newEmployeeUsername: formData.newEmployeeUsername,
        newEmployeeEmail: formData.newEmployeeEmail,
        newEmployeeFullName: formData.newEmployeeFullName,
        newEmployeeJobTitle: formData.newEmployeeJobTitle,
        temporaryPassword: formData.temporaryPassword,
        newEmployeeId: formData.newEmployeeId,
      });

      addRequest(response);
      addToast({
        message: "Employee request submitted successfully",
        type: "success",
      });

      // Reset form
      setFormData({
        newEmployeeUsername: "",
        newEmployeeEmail: "",
        newEmployeeFullName: "",
        newEmployeeJobTitle: "",
        temporaryPassword: "",
        newEmployeeId: "",
      });
    } catch (error) {
      addToast({ message: "Failed to submit request", type: "error" });
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
          <label
            htmlFor="newEmployeeUsername"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            New Employee Username *
          </label>
          <input
            id="newEmployeeUsername"
            name="newEmployeeUsername"
            value={formData.newEmployeeUsername}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            required
            type="text"
            placeholder="johndoe"
          />
        </div>
        <div>
          <label
            htmlFor="newEmployeeEmail"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Email Address *
          </label>
          <input
            id="newEmployeeEmail"
            name="newEmployeeEmail"
            value={formData.newEmployeeEmail}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            required
            type="email"
            placeholder="john.doe@company.com"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="newEmployeeFullName"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Full Name *
          </label>
          <input
            id="newEmployeeFullName"
            name="newEmployeeFullName"
            value={formData.newEmployeeFullName}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            required
            type="text"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label
            htmlFor="newEmployeeJobTitle"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Job Title / Designation
          </label>
          <input
            id="newEmployeeJobTitle"
            name="newEmployeeJobTitle"
            value={formData.newEmployeeJobTitle}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            type="text"
            placeholder="e.g., Support Specialist"
          />
        </div>
      </div>
      <div>
        <label
          htmlFor="newEmployeeId"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Employee ID *
        </label>
        <input
          id="newEmployeeId"
          name="newEmployeeId"
          value={formData.newEmployeeId}
          onChange={handleChange}
          className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
          required
          type="text"
          placeholder="e.g., 1234567890"
        />
      </div>
      <div>
        <label
          htmlFor="temporaryPassword"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Temporary Password *
        </label>
        <input
          id="temporaryPassword"
          name="temporaryPassword"
          value={formData.temporaryPassword}
          onChange={handleChange}
          className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
          required
          type="password"
          placeholder="Secure temporary password"
        />
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Submitting..." : "Submit Request"}
        </button>
      </div>
    </form>
  );
}
