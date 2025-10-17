import { notFound } from "next/navigation";
import { AttachmentGroupService } from "@/lib/api/v2";
import { Metadata } from "next";
import AttachmentGroupViewer from "./components/AttachmentGroupViewer";

interface PageProps {
  params: Promise<{ key: string }>;
}

export default async function AttachmentGroupPage({ params }: PageProps) {
  const { key } = await params;

  // Validate the key format
  if (!key || typeof key !== "string" || key.length < 3) {
    notFound();
  }

  try {
    // Fetch the attachment group by key
    const response = await AttachmentGroupService.getAttachmentGroupByKey(key);

    // If no attachments found, return 404
    if (!response.attachments || response.attachments.length === 0) {
      notFound();
    }

    return (
      <AttachmentGroupViewer
        attachments={response.attachments}
        groupKey={key}
      />
    );
  } catch (error) {
    notFound();
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { key } = await params;

  return {
    title: `Attachment Group ${key} | Dashboard`,
    description: "View attachments in sequential order",
  };
}
