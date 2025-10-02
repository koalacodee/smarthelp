// client component wrapper
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAttachmentStore } from "@/app/(dashboard)/store/useAttachmentStore";
import { useAttachmentsStore } from "@/lib/store/useAttachmentsStore";

export default function StoreResetter() {
  const pathname = usePathname();
  const { clearAll } = useAttachmentStore();
  const { clearAttachments } = useAttachmentsStore();

  // useEffect(() => {
  //   clearAll();
  //   clearAttachments();
  // }, [pathname, clearAll, clearAttachments]);

  return null;
}
