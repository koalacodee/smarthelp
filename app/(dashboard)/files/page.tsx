import { Metadata } from "next";
import AnimatedFilesPage from "./components/AnimatedFilesPage";
import { UploadService } from "@/lib/api/v2";

export const metadata: Metadata = {
  title: "My Files | Dashboard",
  description: "Manage and preview your uploaded files and attachments",
};

export default async function Page() {
  try {
    const response = await UploadService.getMyAttachments();

    return (
      <AnimatedFilesPage
        attachments={response.attachments}
        totalCount={response.totalCount}
        hasMore={response.hasMore}
      />
    );
  } catch (error) {
    console.error("Failed to fetch attachments:", error);
    return (
      <AnimatedFilesPage attachments={[]} totalCount={0} hasMore={false} />
    );
  }
}

export const revalidate = 60; // Revalidate every minute
