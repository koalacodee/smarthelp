"use client";
import { Attachment } from "@/lib/api/v2/services/attachment-group";
import { useEffect, useState, useRef, useCallback } from "react";
import { useAttachmentGroup } from "../useAttachment";
import { env } from "next-runtime-env";
import SingleMediaViewer from "./SingleMediaView";

export default function AttachmentGroupViewer({
  attachments: initialAttachments,
  groupKey,
}: {
  attachments: Attachment[];
  groupKey: string;
}) {
  const attachmentsRef = useRef<Attachment[]>(initialAttachments);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [currentAttachment, setCurrentAttachment] = useState<Attachment | null>(
    initialAttachments[0] || null
  );
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { attachments: wsAttachments } = useAttachmentGroup(
    env("NEXT_PUBLIC_WS_URL") || "",
    groupKey
  );

  // 🧩 handle fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch((err) => {
        console.warn("Failed to enter fullscreen:", err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.warn("Failed to exit fullscreen:", err);
      });
    }
  }, []);

  // 🧠 Update attachments when WebSocket sends new data
  useEffect(() => {
    if (wsAttachments.length > 0) {
      console.log(
        "📦 WS Update: new length =",
        wsAttachments.length,
        "IDs =",
        wsAttachments.map((a) => a.id)
      );

      const oldIds = attachmentsRef.current.map((a) => a.id);
      const newIds = wsAttachments.map((a) => a.id);

      attachmentsRef.current = wsAttachments;

      if (currentIndex >= wsAttachments.length) {
        console.log("🔄 Current index out of bounds, resetting to 0");
        setCurrentIndex(0);
      } else if (oldIds[currentIndex] !== newIds[currentIndex]) {
        console.log("🔄 Attachment at current position changed, reloading");
        setCurrentAttachment(wsAttachments[currentIndex]);
      }
    }
  }, [wsAttachments, currentIndex]);

  // 🎯 Update current attachment when index changes
  useEffect(() => {
    const attachment = attachmentsRef.current[currentIndex] || null;
    console.log(
      "🎯 Index changed to",
      currentIndex,
      "attachment ID:",
      attachment?.id,
      "total in ref:",
      attachmentsRef.current.length
    );

    setCurrentAttachment(attachment);
  }, [currentIndex]);

  // 🎞️ Move to next attachment when media ends
  const handleEnded = () => {
    console.log("🔄 Media ended");
    setCurrentIndex((currentIndex + 1) % attachmentsRef.current.length);
  };

  return (
    <div
      ref={containerRef}
      onClick={toggleFullscreen}
      className="w-screen h-screen bg-black cursor-pointer"
    >
      {currentAttachment && (
        <SingleMediaViewer
          attachment={currentAttachment}
          onEnded={handleEnded}
        />
      )}
    </div>
  );
}
