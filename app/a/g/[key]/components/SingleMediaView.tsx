"use client";
import api from "@/lib/api";
import { UploadService } from "@/lib/api/v2";
import { Attachment } from "@/lib/api/v2/services/attachment-group";
import { env } from "next-runtime-env";
import { useEffect, useRef, useState } from "react";
import React from "react";
import mediaTypes from "@/app/a/g/media.json";

async function getOrStreamAndCacheVideo(
  url: string,
  onCaching?: (isCaching: boolean) => void
): Promise<string> {
  const dbName = "videos-db";
  const storeName = "videos";

  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(dbName, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

  // 🧩 check cache
  const cachedBlob: Blob | undefined = await new Promise((resolve) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const getReq = store.get(url);
    getReq.onsuccess = () => resolve(getReq.result);
    getReq.onerror = () => resolve(undefined);
  });

  // 🎬 if cached → return immediately
  if (cachedBlob) {
    console.log("✅ Loaded from cache");
    onCaching?.(false);
    return URL.createObjectURL(cachedBlob);
  }

  // ⚡ if not cached → stream in background while playing raw url
  console.log("⬇️ Streaming and caching in background...");
  onCaching?.(true);

  // fire and forget background caching
  (async () => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch video");

      const reader = response.body?.getReader();
      const chunks: Uint8Array[] = [];

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) chunks.push(value);
        }
      }

      // Concatenate chunks into a single Uint8Array to avoid type issues
      const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
      const combined = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        combined.set(chunk, offset);
        offset += chunk.length;
      }

      const blob = new Blob([combined], {
        type: response.headers.get("Content-Type") || "video/mp4",
      });

      const tx = db.transaction(storeName, "readwrite");
      const store = tx.objectStore(storeName);
      store.put(blob, url);
      console.log("💾 Video cached successfully");
    } catch (err) {
      console.warn("Cache failed:", err);
    } finally {
      onCaching?.(false);
    }
  })();

  return url;
}

function SingleMediaViewer({
  attachment,
  onEnded = () => {},
}: {
  attachment: Attachment;
  onEnded?: () => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [isCaching, setIsCaching] = useState<boolean>(false);
  const mediaRetrievalType = env("NEXT_PUBLIC_MEDIA_ACCESS_TYPE");
  const baseUrl = api.client.defaults.baseURL;
  const [fileType, setFileType] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const loadUrl = async () => {
      const finalUrl =
        mediaRetrievalType === "signed-url"
          ? (await UploadService.getAttachmentSignedUrl(attachment.id))
              .signedUrl
          : `${baseUrl}/attachment/${attachment.id}`;

      setUrl(await getOrStreamAndCacheVideo(finalUrl, setIsCaching));

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
        setTimeout(() => {
          onEnded();
        }, 5000);
      }
    };
    loadUrl();
  }, [attachment.id]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleEnded = async () => {
      onEnded();
      await video.play().catch((err) => {});
    };
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("ended", handleEnded);
    };
  }, [url]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleEnd = async () => {
      onEnded();
      await audio.play().catch((err) => {});
    };
    audio.addEventListener("ended", handleEnd);

    return () => {
      audio.removeEventListener("ended", handleEnd);
    };
  }, [url]);

  return (
    <div className="relative">
      {/* Cache notification overlay */}
      {isCaching && (
        <div className="absolute top-4 right-4 z-50 flex items-center space-x-2 bg-gradient-to-r from-blue-800 to-blue-700 bg-opacity-85 text-white shadow-lg px-5 py-2 rounded-lg text-base font-medium border border-blue-400">
          <svg
            className="animate-spin h-5 w-5 text-blue-200"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          <span>Caching media …</span>
        </div>
      )}

      {url &&
        (fileType === "video" ? (
          <video
            src={url}
            autoPlay
            ref={videoRef}
            className="w-screen h-screen object-contain bg-black"
            style={{ maxWidth: "100vw", maxHeight: "100vh" }}
          />
        ) : fileType === "audio" ? (
          <audio src={url} autoPlay ref={audioRef} />
        ) : fileType === "image" ? (
          <img
            src={url}
            className="w-screen h-screen object-contain bg-black"
            style={{ maxWidth: "100vw", maxHeight: "100vh" }}
          />
        ) : (
          <div className="text-white text-center">No media found</div>
        ))}
    </div>
  );
}

export default React.memo(SingleMediaViewer, (prevProps, nextProps) => {
  return prevProps.attachment.id === nextProps.attachment.id;
});
