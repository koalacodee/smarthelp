import { Metadata } from "next";
import AnimatedKnowledgeChunksPage from "./components/AnimatedKnowledgeChunksPage";
import { GetAllKnowledgeChunks200ResponseDataInner as KnowledgeChunk } from "@/lib/api/sdk/models";

export const metadata: Metadata = {
  title: "Knowledge Chunks | Knowledge Base Management",
  description:
    "Manage knowledge chunks, create and edit knowledge base entries for better customer support",
};

export interface GroupedKnowledgeChunks {
  departmentId: string;
  departmentName: string;
  chunks: KnowledgeChunk[];
}

export default async function Page() {
  return <AnimatedKnowledgeChunksPage />;
}
