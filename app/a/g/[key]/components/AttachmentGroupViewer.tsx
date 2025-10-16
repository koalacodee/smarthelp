"use client";
import { Attachment } from "@/lib/api/v2/services/attachment-group";
import { useEffect, useState, useRef } from "react";
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
  const { attachments: wsAttachments } = useAttachmentGroup(
    env("NEXT_PUBLIC_WS_URL") || "",
    groupKey
  );
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isMediaReady, setIsMediaReady] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Update ref when WebSocket provides new attachments
  useEffect(() => {
    if (wsAttachments.length > 0) {
      console.log(
        "📦 WS Update: new length =",
        wsAttachments.length,
        "IDs =",
        wsAttachments.map((a) => a.id)
      );

      const oldLength = attachmentsRef.current.length;
      const oldIds = attachmentsRef.current.map((a) => a.id);
      const newIds = wsAttachments.map((a) => a.id);

      attachmentsRef.current = wsAttachments;

      // Clear any existing timer when attachments change
      if (timerRef.current) {
        console.log("🛑 Clearing timer due to attachment update");
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      // If current index is out of bounds (item was deleted), go to first item
      if (currentIndex >= wsAttachments.length) {
        console.log("🔄 Current index out of bounds, resetting to 0");
        setCurrentIndex(0);
      }
      // Check if current attachment still exists
      else if (oldIds[currentIndex] !== newIds[currentIndex]) {
        // The attachment at current position changed, stay but reset ready state
        console.log("🔄 Attachment at current position changed, reloading");
        setCurrentAttachment(wsAttachments[currentIndex]);
        setIsMediaReady(false);
        setDuration(0);
        setCurrentTime(0);
      }
    }
  }, [wsAttachments, currentIndex]);

  // Update currentAttachment when index changes
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

    // Clear existing timer
    if (timerRef.current) {
      console.log("🛑 Clearing timer due to index change");
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    setCurrentAttachment(attachment);
    setIsMediaReady(false);
    setDuration(0);
    setCurrentTime(0);
  }, [currentIndex]);

  // Auto-advance timer - only runs when media is ready
  // useEffect(() => {
  //   // Clear any existing timer first
  //   if (timerRef.current) {
  //     clearTimeout(timerRef.current);
  //     timerRef.current = null;
  //   }

  //   if (!isMediaReady || duration <= 0 || attachmentsRef.current.length === 0) {
  //     return;
  //   }

  //   console.log(
  //     "⏰ Setting timeout. Current:",
  //     currentIndex,
  //     "Duration:",
  //     duration,
  //     "CurrentTime:",
  //     currentTime,
  //     "Total in ref:",
  //     attachmentsRef.current.length
  //   );

  //   const remainingTime = duration - currentTime;
  //   timerRef.current = setTimeout(() => {
  //     const totalLength = attachmentsRef.current.length;
  //     const nextIndex = (currentIndex + 1) % totalLength;
  //     console.log(
  //       "⏭️ Timeout fired! Moving from",
  //       currentIndex,
  //       "to",
  //       nextIndex,
  //       "total length:",
  //       totalLength
  //     );
  //     setCurrentIndex(nextIndex);
  //   }, remainingTime * 1000);

  //   return () => {
  //     if (timerRef.current) {
  //       clearTimeout(timerRef.current);
  //       timerRef.current = null;
  //     }
  //   };
  // }, [duration, currentTime, currentIndex, isMediaReady]);

  const handleEnded = () => {
    console.log("🔄 Media ended");
    setCurrentIndex((currentIndex + 1) % attachmentsRef.current.length);
  };

  // Handle duration loaded
  const handleDuration = (newDuration: number) => {
    console.log(
      "📏 Duration loaded:",
      newDuration,
      "for attachment:",
      currentAttachment?.id
    );
    setDuration(newDuration);
    setIsMediaReady(true);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <>
      {currentAttachment && (
        <SingleMediaViewer
          attachment={currentAttachment}
          onDuration={handleDuration}
          onCurrentTime={setCurrentTime}
          onEnded={handleEnded}
        />
      )}
    </>
  );
}
