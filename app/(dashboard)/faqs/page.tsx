import { Metadata } from "next";
import { Question } from "@/lib/api/types";
import { FAQService } from "@/lib/api/v2";
import AnimatedFAQsHeader from "./components/AnimatedFAQsHeader";
import FaqsFilters from "./components/FaqsFilters";
import FaqsTable from "./components/FaqsTable";
import FaqEditModal from "./components/FaqEditModal";
import AddNewFaqButton from "./components/AddNewFaqButton";

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

  console.log(res);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6 animate-fade-in tw-duration-400">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <AnimatedFAQsHeader />

        {/* Filters Section */}
        <div className="animate-fade-in-down tw-duration-500 tw-delay-200">
          <FaqsFilters />
        </div>

        {/* Table Section */}
        <div className="animate-fade-in-down tw-duration-500 tw-delay-400">
          <div className="bg-white/90  rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <FaqsTable
              questions={res.questions}
              attachments={res.attachments}
              fileHubAttachments={res.fileHubAttachments}
            />
          </div>
        </div>

        <FaqEditModal />
      </div>
      <AddNewFaqButton />
    </div>
  );
}
