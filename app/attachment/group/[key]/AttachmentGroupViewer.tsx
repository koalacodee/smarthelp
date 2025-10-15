"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Attachment } from "@/lib/api/v2/services/attachment-group";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import { env } from "next-runtime-env";
import api from "@/lib/api";
import { UploadService } from "@/lib/api/v2";

interface AttachmentGroupViewerProps {
  attachments: Attachment[];
  groupKey: string;
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

export default function AttachmentGroupViewer({
  attachments,
  groupKey,
}: AttachmentGroupViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);
  const fullScreenHandle = useFullScreenHandle();

  const currentAttachment = attachments[currentIndex];
  const totalAttachments = attachments.length;

  // Load the current attachment's media URL
  useEffect(() => {
    const loadAttachment = async () => {
      setIsLoading(true);
      try {
        const mediaRetrievalType = env("NEXT_PUBLIC_MEDIA_ACCESS_TYPE");
        const baseUrl = api.client.defaults.baseURL;
        let url;

        if (mediaRetrievalType === "signed-url") {
          const signedUrl = await UploadService.getAttachmentSignedUrl(
            currentAttachment.id
          );
          url = await getCachedVideoFromIndexedDB(signedUrl.signedUrl);
        } else {
          url = await getCachedVideoFromIndexedDB(
            `${baseUrl}/attachment/${currentAttachment.id}`
          );
        }

        setMediaUrl(url);
      } catch (error) {
        console.error("Error loading attachment:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAttachment();

    // Clear any existing timers
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [currentAttachment.id]);

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalAttachments);
  };

  const goToPrevious = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + totalAttachments) % totalAttachments
    );
  };

  const getFileType = (contentType: string, originalName?: string) => {
    const lowerContentType = contentType?.toLowerCase() || "";

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

  const fileType = getFileType(
    currentAttachment.contentType || "",
    currentAttachment.originalName
  );

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        goToNext();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        goToPrevious();
      } else if (e.key === "f" || e.key === "F") {
        fullScreenHandle.active
          ? fullScreenHandle.exit()
          : fullScreenHandle.enter();
      } else if (e.key === "Escape" && !fullScreenHandle.active) {
        window.history.back();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [fullScreenHandle]);

  // Toggle fullscreen using react-full-screen
  useEffect(() => {
    // We need to handle the fullscreen request with user interaction
    // due to browser security policies
    const handleUserInteraction = () => {
      if (!mediaUrl) return;

      if (fullScreenHandle.active) {
        // If already in fullscreen, exit
        fullScreenHandle.exit();
      } else {
        // If not in fullscreen, enter
        fullScreenHandle.enter().catch((err) => {
          console.warn("Fullscreen request failed:", err);
          // Fallback to original method if react-full-screen fails
          if (elementRef.current) {
            try {
              if (document.fullscreenElement) {
                // Exit fullscreen if already in fullscreen
                document.exitFullscreen().catch((e) => {
                  console.warn("Exit fullscreen failed:", e);
                });
              } else {
                // Enter fullscreen
                if (elementRef.current.requestFullscreen) {
                  elementRef.current.requestFullscreen();
                } else if (
                  (elementRef.current as any).webkitRequestFullscreen
                ) {
                  (elementRef.current as any).webkitRequestFullscreen();
                } else if ((elementRef.current as any).msRequestFullscreen) {
                  (elementRef.current as any).msRequestFullscreen();
                }
              }
            } catch (e) {
              console.warn("Native fullscreen toggle failed:", e);
            }
          }
        });
      }
    };

    // Add event listeners for user interaction
    document.addEventListener("click", handleUserInteraction);
    document.addEventListener("touchstart", handleUserInteraction);

    return () => {
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("touchstart", handleUserInteraction);
    };
  }, [mediaUrl, fullScreenHandle]);

  // Set up automatic looping
  useEffect(() => {
    if (isLoading || !mediaUrl) return;

    // Only set up automatic looping for images if there are multiple attachments
    if (isImage(fileType) && totalAttachments > 1) {
      // For images, set a 5-second timer
      timerRef.current = setTimeout(() => {
        goToNext();
      }, 5000);
    }
    // For single images, we don't set a timer (image stays forever)
  }, [isLoading, mediaUrl, fileType, totalAttachments]);

  // Handle video/audio ended event separately
  useEffect(() => {
    // For video/audio, handle the ended event
    const handleMediaEnded = () => {
      if (totalAttachments > 1) {
        // If multiple attachments, advance to next
        console.log("Media ended, advancing to next");
        goToNext();
      } else {
        // If only one attachment, loop the current media
        console.log("Single media ended, looping");
        if (mediaRef.current) {
          mediaRef.current.currentTime = 0;
          mediaRef.current.play().catch((err) => {
            console.error("Failed to replay single media:", err);
          });
        }
      }
    };

    // Need to wait for the ref to be populated
    if (mediaRef.current && (isVideo(fileType) || isAudio(fileType))) {
      console.log("Adding ended event listener");
      mediaRef.current.onended = handleMediaEnded;

      // Set loop attribute for single media
      if (totalAttachments === 1) {
        mediaRef.current.loop = true;
      } else {
        mediaRef.current.loop = false;
      }

      // Try to play the media element if it's not already playing
      if (mediaRef.current.paused) {
        console.log("Media is paused, attempting to play");
        mediaRef.current.play().catch((err) => {
          console.log("Autoplay prevented in effect:", err);
          // For video, try with muted if normal play fails
          if (isVideo(fileType) && mediaRef.current) {
            mediaRef.current.muted = true;
            mediaRef.current.play().catch((err2) => {
              console.error("Even muted autoplay failed in effect:", err2);
            });
          }
        });
      }
    }

    return () => {
      if (mediaRef.current) {
        mediaRef.current.onended = null;
      }
    };
  }, [currentIndex, mediaUrl, fileType]);

  return (
    <FullScreen handle={fullScreenHandle} className="bg-black">
      <div className="fixed inset-0 bg-black overflow-hidden" ref={elementRef}>
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </motion.div>
          ) : mediaUrl ? (
            <motion.div
              key={currentAttachment.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {isImage(fileType) && (
                <div className="w-full h-full relative">
                  <img
                    src={mediaUrl}
                    alt={currentAttachment.originalName}
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                </div>
              )}

              {isVideo(fileType) && (
                <div className="w-full h-full">
                  <video
                    ref={mediaRef as React.RefObject<HTMLVideoElement>}
                    src={mediaUrl}
                    className="absolute inset-0 w-full h-full object-contain"
                    controls={false}
                    autoPlay
                    playsInline
                    muted={false}
                    loop={totalAttachments === 1}
                    onEnded={totalAttachments > 1 ? goToNext : undefined}
                    onLoadedData={(e) => {
                      // Explicitly try to play when loaded
                      const video = e.currentTarget;
                      video.play().catch((err) => {
                        console.log("Autoplay prevented, trying muted:", err);
                        // If autoplay is prevented, try muted autoplay
                        video.muted = true;
                        video.play().catch((err2) => {
                          console.error("Even muted autoplay failed:", err2);
                        });
                      });
                    }}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}

              {isAudio(fileType) && (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-black">
                  <div className="w-full max-w-md p-8 relative">
                    <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg
                        className="w-12 h-12 text-blue-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071a1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243a1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828a1 1 0 010-1.415z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <audio
                      ref={mediaRef as React.RefObject<HTMLAudioElement>}
                      src={mediaUrl}
                      className="w-full"
                      controls={false}
                      autoPlay
                      loop={totalAttachments === 1}
                      onEnded={totalAttachments > 1 ? goToNext : undefined}
                      onLoadedData={(e) => {
                        // Explicitly try to play when loaded
                        const audio = e.currentTarget;
                        audio.play().catch((err) => {
                          console.log("Audio autoplay prevented:", err);
                        });
                      }}
                    >
                      Your browser does not support the audio element.
                    </audio>
                    <div className="text-center mt-4">
                      <p className="text-white text-lg font-medium truncate">
                        {currentAttachment.originalName}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!isImage(fileType) &&
                !isVideo(fileType) &&
                !isAudio(fileType) && (
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6">
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
                    <p className="text-white text-xl font-medium mb-2">
                      {currentAttachment.originalName}
                    </p>
                    <p className="text-gray-400 mb-4">
                      File type not supported for preview
                    </p>
                  </div>
                )}
            </motion.div>
          ) : (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <p className="text-red-400">Failed to load attachment</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Minimal navigation controls - only visible on hover */}
        <div className="absolute inset-x-0 top-0 h-16 flex items-center justify-between px-4 opacity-0 hover:opacity-100 transition-opacity duration-300 bg-gradient-to-b from-black/80 to-transparent">
          <button
            onClick={() => window.history.back()}
            className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white"
            aria-label="Go back"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>

          {totalAttachments > 1 && (
            <div className="text-white text-sm">
              {currentIndex + 1} / {totalAttachments}
            </div>
          )}
        </div>

        {/* Navigation buttons - only visible when multiple attachments */}
        {totalAttachments > 1 && (
          <>
            <div className="absolute inset-y-0 left-0 w-1/4 flex items-center justify-start px-4 opacity-0 hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={goToPrevious}
                className="p-3 rounded-full bg-black/40 hover:bg-black/60 text-white"
                aria-label="Previous attachment"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
            </div>

            <div className="absolute inset-y-0 right-0 w-1/4 flex items-center justify-end px-4 opacity-0 hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={goToNext}
                className="p-3 rounded-full bg-black/40 hover:bg-black/60 text-white"
                aria-label="Next attachment"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
    </FullScreen>
  );
}
