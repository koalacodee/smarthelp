"use client";
import { AttachmentMetadata } from "@/lib/api/v2/services/filehub-attachment-groups";
import { useEffect, useState, useRef, useCallback } from "react";
import { useFileHubAttachmentGroup } from "../useFileHubAttachment";
import { env } from "next-runtime-env";
import FileHubSingleMediaView from "./FileHubSingleMediaView";
import { FileHubAttachmentGroupService } from "@/lib/api/v2";

export default function FileHubAttachmentGroupViewer({
  groupKey,
}: {
  groupKey: string;
}) {
  const attachmentsRef = useRef<AttachmentMetadata[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [currentAttachment, setCurrentAttachment] =
    useState<AttachmentMetadata | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchAttachments = async () => {
      const response =
        await FileHubAttachmentGroupService.getAttachmentGroupByKey(groupKey);

      attachmentsRef.current = response.data.attachments;
      setCurrentAttachment(response.data.attachments[0]);
    };

    fetchAttachments();
  }, [groupKey]);

  const { attachments: wsAttachments } = useFileHubAttachmentGroup(
    env("NEXT_PUBLIC_WS_URL") || "",
    groupKey
  );

  // 🧩 handle fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch((err) => {
        // Failed to enter fullscreen
      });
    } else {
      document.exitFullscreen().catch((err) => {
        // Failed to exit fullscreen
      });
    }
  }, []);

  // 🧠 Update attachments when WebSocket sends new data
  useEffect(() => {
    if (wsAttachments.length > 0) {
      const oldIds = attachmentsRef.current.map((a) => a.id);
      const newIds = wsAttachments.map((a) => a.id);

      attachmentsRef.current = wsAttachments;

      if (currentIndex >= wsAttachments.length) {
        setCurrentIndex(0);
      } else if (oldIds[currentIndex] !== newIds[currentIndex]) {
        setCurrentAttachment(wsAttachments[currentIndex]);
      }
    }
  }, [wsAttachments, currentIndex]);

  // 🎯 Update current attachment when index changes
  useEffect(() => {
    const attachment = attachmentsRef.current[currentIndex] || null;
    setCurrentAttachment(attachment);
  }, [currentIndex]);

  // 🎞️ Move to next attachment when media ends
  const handleEnded = () => {
    setCurrentIndex((currentIndex + 1) % attachmentsRef.current.length);
  };

  return (
    <div
      ref={containerRef}
      onClick={toggleFullscreen}
      className="w-screen h-screen bg-black cursor-pointer"
    >
      {currentAttachment && (
        <FileHubSingleMediaView
          attachment={currentAttachment}
          onEnded={handleEnded}
        />
      )}
    </div>
  );
}
