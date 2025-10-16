"use client";
import api from "@/lib/api";
import { UploadService } from "@/lib/api/v2";
import { Attachment } from "@/lib/api/v2/services/attachment-group";
import { env } from "next-runtime-env";
import { useEffect, useRef, useState } from "react";
import React from "react";
import mediaTypes from "@/app/a/g/media.json";

async function getCachedVideoFromIndexedDB(url: string): Promise<string> {
  const dbName = "videos-db";
  const storeName = "videos";

  // فتح أو إنشاء قاعدة البيانات
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  // شوف لو الفيديو متخزن بالفعل
  const cachedBlob: Blob | undefined = await new Promise((resolve) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const getReq = store.get(url);
    getReq.onsuccess = () => resolve(getReq.result);
    getReq.onerror = () => resolve(undefined);
  });

  if (cachedBlob) {
    console.log("🎬 Loaded video from IndexedDB");
    return URL.createObjectURL(cachedBlob);
  }

  // لو مش موجود، جيبه من السيرفر وخزّنه
  console.log("⬇️ Fetching video from server...");
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch video");
  const blob = await response.blob();

  // خزّنه في IndexedDB
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const putReq = store.put(blob, url);
    putReq.onsuccess = () => resolve();
    putReq.onerror = () => reject(putReq.error);
  });

  return URL.createObjectURL(blob);
}

function SingleMediaViewer({
  attachment,
  onDuration = () => {},
  onCurrentTime = () => {},
}: {
  attachment: Attachment;
  onDuration?: (duration: number) => void;
  onCurrentTime?: (currentTime: number) => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const mediaRetrievalType = env("NEXT_PUBLIC_MEDIA_ACCESS_TYPE");
  const baseUrl = api.client.defaults.baseURL;
  const [fileType, setFileType] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    const loadUrl = async () => {
      if (mediaRetrievalType === "signed-url") {
        const signedUrl = await UploadService.getAttachmentSignedUrl(
          attachment.id
        );
        setUrl(await getCachedVideoFromIndexedDB(signedUrl.signedUrl));
      } else {
        setUrl(
          await getCachedVideoFromIndexedDB(
            `${baseUrl}/attachment/${attachment.id}`
          )
        );
      }
      if (attachment.fileType) {
        setFileType(attachment.fileType);
      } else {
        if (mediaTypes.media.image.extensions.includes(attachment.type)) {
          setFileType("image");
        } else if (
          mediaTypes.media.audio.extensions.includes(attachment.type)
        ) {
          setFileType("audio");
        } else if (
          mediaTypes.media.video.extensions.includes(attachment.type)
        ) {
          setFileType("video");
        }
      }

      if (fileType === "image") {
        onDuration(5);
      }
    };
    loadUrl();
  }, [attachment.id]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleMetadata = () => {
      onDuration(video.duration || 0);
    };

    video.addEventListener("loadedmetadata", handleMetadata);

    return () => {
      video.removeEventListener("loadedmetadata", handleMetadata);
    };
  }, [url]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleMetadata = () => {
      onDuration(audio.duration || 0);
    };

    audio.addEventListener("loadedmetadata", handleMetadata);

    return () => {
      audio.removeEventListener("loadedmetadata", handleMetadata);
    };
  }, [url]);

  return (
    <>
      {url &&
        (fileType === "video" ? (
          <video
            src={url}
            loop
            autoPlay
            ref={videoRef}
            className="w-screen h-screen object-contain bg-black"
            style={{ maxWidth: "100vw", maxHeight: "100vh" }}
            onTimeUpdate={(e) => onCurrentTime(e.currentTarget.currentTime)}
          />
        ) : fileType === "audio" ? (
          <audio
            src={url}
            loop
            autoPlay
            ref={audioRef}
            onTimeUpdate={(e) => onCurrentTime(e.currentTarget.currentTime)}
          />
        ) : fileType === "image" ? (
          <img
            src={url}
            className="w-screen h-screen object-contain bg-black"
            style={{ maxWidth: "100vw", maxHeight: "100vh" }}
          />
        ) : (
          <div>
            <h1>No media found</h1>
          </div>
        ))}
    </>
  );
}

// Memoize component to prevent re-renders when attachment.id is the same
export default React.memo(SingleMediaViewer, (prevProps, nextProps) => {
  return prevProps.attachment.id === nextProps.attachment.id;
});
