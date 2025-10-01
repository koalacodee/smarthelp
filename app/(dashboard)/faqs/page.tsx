import { Metadata } from "next";
import { FAQsService } from "@/lib/api";
import FaqEditModal from "./components/FaqEditModal";
import FaqsTable from "./components/FaqsTable";
import FaqsFilters from "./components/FaqsFilters";
import AddNewFaqButton from "./components/AddNewFaqButton";
import { Question } from "@/lib/api/types";
import { FAQService } from "@/lib/api/v2";

export const metadata: Metadata = {
  title: "FAQs | Knowledge Base Management",
  description:
    "Manage frequently asked questions, create and edit FAQ entries for better customer support",
};

export interface GroupedFAQs {
  departmentId: string;
  departmentName: string;
  questions: GroupedFAQsQuestion[];
}

export interface GroupedFAQsQuestion extends Question {
  departmentName?: string;
}

export default async function Page() {
  const res = await FAQService.getAllGroupedByDepartment();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 rounded-2xl"></div>
          <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                  Knowledge Base
                </h1>
                <p className="text-slate-600 text-lg">
                  Manage frequently asked questions and build a comprehensive
                  knowledge base
                </p>
              </div>
              <div className="flex-shrink-0">
                <AddNewFaqButton />
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="animate-fade-in-up">
          <FaqsFilters />
        </div>

        {/* Table Section */}
        <div className="animate-fade-in-up animation-delay-200">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <FaqsTable
              questions={res.questions}
              attachments={res.attachments}
            />
          </div>
        </div>

        <FaqEditModal />
      </div>
    </div>
  );
}
