import { Metadata } from "next";
import { FAQsService } from "@/lib/api";
import FaqEditModal from "./components/FaqEditModal";
import FaqsTable from "./components/FaqsTable";
import AddNewFaqButton from "./components/AddNewFaqButton";
import { Question } from "@/lib/api/types";

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
  return (
    <div className="bg-white p-6 rounded-lg shadow overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-slate-800">Manage FAQs</h3>
        <AddNewFaqButton />
      </div>
      <FaqsTable />
      <FaqEditModal />
    </div>
  );
}
