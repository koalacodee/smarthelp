import KnowledgeChunksTable from "./components/KnowledgeChunksTable";
import KnowledgeChunkEditModal from "./components/KnowledgeChunkEditModal";
import AddNewKnowledgeChunkButton from "./components/AddNewKnowledgeChunkButton";
import KnowledgeChunkViewWidget from "./components/KnowledgeChunkViewWidget";
import { GetAllKnowledgeChunks200ResponseDataInner as KnowledgeChunk } from "@/lib/api/sdk/models";

export interface GroupedKnowledgeChunks {
  departmentId: string;
  departmentName: string;
  chunks: KnowledgeChunk[];
}

export default async function Page() {
  return (
    <div className="bg-card p-6 rounded-lg shadow overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-foreground">
          Manage Knowledge Chunks
        </h3>
        <AddNewKnowledgeChunkButton />
      </div>
      <KnowledgeChunksTable />
      <KnowledgeChunkEditModal />
      <KnowledgeChunkViewWidget />
    </div>
  );
}
