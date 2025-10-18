import { notFound } from "next/navigation";
import AttachmentPageClient from "./AttachmentPageClient";
import { UploadService } from "@/lib/api/v2";
import { env } from "next-runtime-env";
import api from "@/lib/api";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AttachmentPage({ params }: PageProps) {
  const { id } = await params;

  // First, get the attachment metadata
  const metadataResponse = await UploadService.getAttachmentMetadata({
    tokenOrId: id,
  });

  const mediaRetrievalType = env("NEXT_PUBLIC_MEDIA_ACCESS_TYPE");

  let mediaUrl = null;
  const baseUrl = api.client.defaults.baseURL;

  if (mediaRetrievalType === "signed-url") {
    const signedUrl = await UploadService.getAttachmentSignedUrl(id);
    mediaUrl = signedUrl.signedUrl;
  } else {
    mediaUrl = `${baseUrl}/attachment/${id}`;
  }

  // Validate the ID format (should be a valid UUID or token)
  if (!id || typeof id !== "string" || id.length < 8) {
    notFound();
  }

  try {
    // We'll fetch the metadata on the client side to avoid hydration issues
    // and to handle the media access properly
    return <AttachmentPageClient meta={metadataResponse} url={mediaUrl} />;
  } catch (error) {
    notFound();
  }
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;

  return {
    title: `Attachment ${id.slice(0, 8)}... | Dashboard`,
    description: "View attachment in full screen",
  };
}
