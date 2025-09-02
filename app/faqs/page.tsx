"use client";

import { useEffect } from "react";
import FaqEditModal from "./components/FaqEditModal";
import FaqsTable from "./components/FaqsTable";
import axios from "axios";
import { useGroupedFAQsStore } from "./store/useGroupedFAQsStore";
import { useCurrentEditingFAQStore } from "./store/useCurrentEditingFAQ";
import { Question } from "@/lib/api/types";
import api from "@/lib/api";

export interface GroupedFAQs {
  departmentId: string;
  departmentName: string;
  questions: GroupedFAQsQuestion[];
}

export interface GroupedFAQsQuestion extends Question {
  departmentName?: string;
}

export default function Page() {
  const { faqs, setFAQs } = useGroupedFAQsStore();
  const { setFaq, setIsEditing, isEditing } = useCurrentEditingFAQStore();
  const refreshFAQs = () => {
    api.FAQsService.getGrouped().then((res) => {
      setFAQs(res.data.data);
    });
  };

  useEffect(() => {
    refreshFAQs();
  }, []);
  return (
    <div className="bg-white p-6 rounded-lg shadow overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-slate-800">Manage FAQs</h3>
        <button
          onClick={() => {
            setIsEditing(true);
            setFaq(null);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium cursor-pointer hover:bg-blue-700"
        >
          Add New FAQ
        </button>
      </div>
      <FaqsTable faqs={faqs} />
      {isEditing && <FaqEditModal onSuccess={refreshFAQs} />}
    </div>
  );
}
