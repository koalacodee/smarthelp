import { notFound } from "next/navigation";
import { Metadata } from "next";
import FileHubAttachmentGroupViewer from "./components/FileHubAttachmentGroupViewer";
import { env } from "next-runtime-env";
import { GetAttachmentGroupByKeyResponse } from "@/lib/api/v2/services/filehub-attachment-groups";

interface PageProps {
  params: Promise<{ key: string }>;
}

export default async function FileHubAttachmentGroupPage({
  params,
}: PageProps) {
  const { key } = await params;

  // Validate the key format
  if (!key || typeof key !== "string" || key.length < 3) {
    notFound();
  }

  try {
    return <FileHubAttachmentGroupViewer groupKey={key} />;
  } catch (error) {
    console.log(error);
    notFound();
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { key } = await params;

  return {
    title: `FileHub Attachment Group ${key} | Dashboard`,
    description: "View FileHub attachments in sequential order",
  };
}
