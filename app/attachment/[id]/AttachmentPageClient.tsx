"use client";
import React, { useState, useEffect, useRef } from "react";

interface AttachmentPageClientProps {
  meta: AttachmentMetadata;
  url: string;
}

interface AttachmentMetadata {
  id: string;
  filename: string;
  originalName: string;
  targetId: string;
  expirationDate?: string;
  createdAt: string;
  updatedAt: string;
  contentType: string;
  size: number;
}

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

export default function AttachmentPageClient({
  meta,
  url,
}: AttachmentPageClientProps) {
  const elementRef = useRef<any>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadMedia = async () => {
      const videoUrl = await getCachedVideoFromIndexedDB(url);
      setMediaUrl(videoUrl);
    };
    loadMedia();
  }, [url]);

  const getFileType = (contentType: string, originalName?: string) => {
    const lowerContentType = contentType.toLowerCase();

    if (lowerContentType.startsWith("image/")) return "image";
    if (lowerContentType.startsWith("video/")) return "video";
    if (lowerContentType.startsWith("audio/")) return "audio";

    if (originalName) {
      const extension = originalName.split(".").pop()?.toLowerCase();
      return extension || "unknown";
    }

    return "unknown";
  };

  const isImage = (fileType: string) => {
    return [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "webp",
      "svg",
      "bmp",
      "image",
    ].includes(fileType.toLowerCase());
  };

  const isVideo = (fileType: string) => {
    return ["mp4", "webm", "ogg", "avi", "mov", "wmv", "flv", "video"].includes(
      fileType.toLowerCase()
    );
  };

  const isAudio = (fileType: string) => {
    return ["mp3", "wav", "ogg", "aac", "flac", "m4a", "audio"].includes(
      fileType.toLowerCase()
    );
  };

  const fileType = getFileType(meta.contentType, meta.originalName);

  // Auto-fullscreen for videos
  useEffect(() => {
    const enterFullscreen = async () => {
      if (elementRef.current) {
        if (elementRef.current.requestFullscreen) {
          await elementRef.current.requestFullscreen();
        } else if (elementRef.current.webkitRequestFullscreen) {
          await elementRef.current.webkitRequestFullscreen(); // Safari
        }
      }
    };
    enterFullscreen();
  }, [fileType]);

  return (
    <div className="bg-black min-h-screen flex items-center justify-center p-6 pt-20">
      {mediaUrl && (
        <div className="w-full max-w-7xl mx-auto">
          {isImage(fileType) && (
            <div className="flex justify-center">
              <img
                src={mediaUrl}
                alt={meta.originalName}
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                ref={elementRef}
              />
            </div>
          )}

          {isVideo(fileType) && (
            <div className="flex justify-center">
              <video
                ref={elementRef}
                src={mediaUrl}
                controls
                className="max-w-full max-h-[80vh] rounded-lg shadow-2xl"
                preload="metadata"
                autoPlay
                loop
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          {isAudio(fileType) && (
            <div className="flex justify-center">
              <div className="w-full max-w-md bg-white/10 backdrop-blur-sm rounded-xl p-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg
                      className="w-10 h-10 text-blue-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <h3 className="text-white font-semibold mb-2">
                    {meta.originalName}
                  </h3>
                  <audio
                    src={mediaUrl}
                    controls
                    className="w-full"
                    preload="metadata"
                    autoPlay
                    loop
                    ref={elementRef}
                  >
                    Your browser does not support the audio element.
                  </audio>
                </div>
              </div>
            </div>
          )}

          {!isImage(fileType) && !isVideo(fileType) && !isAudio(fileType) && (
            <div className="text-center">
              <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-12 h-12 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h2 className="text-white text-2xl font-bold mb-4">
                Preview not available
              </h2>
              <p className="text-gray-300 mb-8 max-w-md mx-auto">
                This file type ({fileType}) cannot be previewed in the browser.
              </p>
              <a
                href={mediaUrl}
                download={meta.originalName}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Download File
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
