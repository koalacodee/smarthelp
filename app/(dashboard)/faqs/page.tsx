import { Metadata } from "next";
import AnimatedFAQsPage from "./components/AnimatedFAQsPage";
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
    <AnimatedFAQsPage questions={res.questions} attachments={res.attachments} />
  );
}
