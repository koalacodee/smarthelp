"use client";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import api from "@/lib/api";
import { AudienceType } from "@/lib/api/types";
import { useState } from "react";

export default function CreatePromotionForm() {
  const [title, setTitle] = useState("");
  const [audience, setAudience] = useState<AudienceType>(AudienceType.ALL);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const addToast = useToastStore((state) => state.addToast);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    api.PromotionService.createPromotion({
      title,
      audience,
      startDate,
      endDate,
    })
      .then(() => {
        addToast({
          message: "Promotion Created Successfully",
          type: "success",
        });
      })
      .catch(() => {
        addToast({
          message: "Failed to create promotion",
          type: "error",
        });
      });
  };

  return (
    <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
      <div>
        <label
          htmlFor="promo-title"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Promotion Title
        </label>
        <input
          id="promo-title"
          placeholder="e.g., Summer Sale"
          className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
          required
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div>
        <label
          htmlFor="promo-attachment"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Promotion Media (Image or Video)
        </label>
        <input
          id="promo-attachment"
          accept="image/*,video/*"
          className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          type="file"
        />
      </div>
      <div>
        <label
          htmlFor="promo-audience"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Target Audience
        </label>
        <select
          id="promo-audience"
          className="w-full border border-slate-300 rounded-md p-2 bg-white focus:ring-blue-500 focus:border-blue-500"
          required
          value={audience}
          onChange={(e) => setAudience(e.target.value as AudienceType)}
        >
          <option value={AudienceType.ALL}>
            All Users (Customers, Supervisors, Employees)
          </option>
          <option value={AudienceType.CUSTOMER}>Customers Only</option>
          <option value={AudienceType.SUPERVISOR}>Supervisors Only</option>
          <option value={AudienceType.EMPLOYEE}>Employees Only</option>
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="promo-start-date"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Start Date (Optional)
          </label>
          <input
            id="promo-start-date"
            className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label
            htmlFor="promo-end-date"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            End Date (Optional)
          </label>
          <input
            id="promo-end-date"
            className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
        >
          Create Promotion
        </button>
      </div>
    </form>
  );
}
