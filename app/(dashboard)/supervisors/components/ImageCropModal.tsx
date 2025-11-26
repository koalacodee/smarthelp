"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useImageCropStore } from "../store/useImageCropStore";
import X from "@/icons/X";

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageCropModalProps {
  onCropComplete?: (croppedFile: File) => void;
}

export default function ImageCropModal({
  onCropComplete,
}: ImageCropModalProps) {
  const {
    isOpen,
    imageUrl,
    aspectRatio,
    minCropSize,
    closeCropModal,
    setCropArea,
    setCroppedImage,
  } = useImageCropStore();

  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [displayDimensions, setDisplayDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [cropArea, setCropAreaState] = useState<CropArea | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [scale, setScale] = useState(1);

  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate initial crop area when image loads
  useEffect(() => {
    if (
      imageLoaded &&
      imageDimensions.width > 0 &&
      imageDimensions.height > 0
    ) {
      const containerWidth = containerRef.current?.clientWidth || 400;
      const containerHeight = containerRef.current?.clientHeight || 400;

      const scaleX = containerWidth / imageDimensions.width;
      const scaleY = containerHeight / imageDimensions.height;
      const newScale = Math.min(scaleX, scaleY);

      const displayWidth = imageDimensions.width * newScale;
      const displayHeight = imageDimensions.height * newScale;

      setScale(newScale);
      setDisplayDimensions({ width: displayWidth, height: displayHeight });

      // Only set initial crop area if we don't already have one
      if (!cropArea) {
        // Calculate initial crop area (centered square)
        const cropSize = Math.min(displayWidth, displayHeight) * 0.8;
        const x = (displayWidth - cropSize) / 2;
        const y = (displayHeight - cropSize) / 2;

        const initialCropArea = {
          x,
          y,
          width: cropSize,
          height: cropSize,
        };

        setCropAreaState(initialCropArea);
        setCropArea(initialCropArea);
      }
    }
  }, [imageLoaded, imageDimensions, setCropArea, cropArea]);

  const handleImageLoad = useCallback(() => {
    if (imageRef.current) {
      setImageDimensions({
        width: imageRef.current.naturalWidth,
        height: imageRef.current.naturalHeight,
      });
      setImageLoaded(true);
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent, handle?: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (handle) {
      setIsResizing(true);
      setResizeHandle(handle);
    } else {
      setIsDragging(true);
    }
    // Set drag start to current mouse position, not the crop area position
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!cropArea || !containerRef.current) return;

      if (isDragging) {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;

        // Get the actual image display size within the container
        const imageElement = imageRef.current;
        if (!imageElement) return;

        // Calculate the actual image display dimensions within the container
        const actualImageWidth = imageElement.clientWidth;
        const actualImageHeight = imageElement.clientHeight;

        const newCropArea = {
          ...cropArea,
          x: Math.max(
            0,
            Math.min(actualImageWidth - cropArea.width, cropArea.x + deltaX)
          ),
          y: Math.max(
            0,
            Math.min(actualImageHeight - cropArea.height, cropArea.y + deltaY)
          ),
        };

        setCropAreaState(newCropArea);
        setCropArea(newCropArea);
        setDragStart({ x: e.clientX, y: e.clientY });
      } else if (isResizing && resizeHandle) {
        let newCropArea = { ...cropArea };

        // Get the actual image display size within the container
        const imageElement = imageRef.current;
        if (!imageElement) return;

        const actualImageWidth = imageElement.clientWidth;
        const actualImageHeight = imageElement.clientHeight;

        // Calculate mouse position relative to the image element
        const imageRect = imageElement.getBoundingClientRect();
        const imageX = e.clientX - imageRect.left;
        const imageY = e.clientY - imageRect.top;

        // Calculate maximum crop size (up to the full display size)
        const maxCropSize = Math.min(actualImageWidth, actualImageHeight);

        switch (resizeHandle) {
          case "se":
            newCropArea.width = Math.max(
              minCropSize,
              Math.min(maxCropSize, imageX - cropArea.x)
            );
            newCropArea.height = newCropArea.width; // 1:1 ratio

            break;
          case "sw":
            newCropArea.width = Math.max(
              minCropSize,
              Math.min(maxCropSize, cropArea.x + cropArea.width - imageX)
            );
            newCropArea.height = newCropArea.width; // 1:1 ratio
            newCropArea.x = cropArea.x + cropArea.width - newCropArea.width;

            break;
          case "ne":
            newCropArea.height = Math.max(
              minCropSize,
              Math.min(maxCropSize, cropArea.y + cropArea.height - imageY)
            );
            newCropArea.width = newCropArea.height; // 1:1 ratio
            newCropArea.y = cropArea.y + cropArea.height - newCropArea.height;

            break;
          case "nw":
            newCropArea.width = Math.max(
              minCropSize,
              Math.min(maxCropSize, cropArea.x + cropArea.width - imageX)
            );
            newCropArea.height = newCropArea.width; // 1:1 ratio
            newCropArea.x = cropArea.x + cropArea.width - newCropArea.width;
            newCropArea.y = cropArea.y + cropArea.height - newCropArea.height;

            break;
          case "n":
            newCropArea.height = Math.max(
              minCropSize,
              Math.min(maxCropSize, cropArea.y + cropArea.height - imageY)
            );
            newCropArea.width = newCropArea.height; // 1:1 ratio
            newCropArea.y = cropArea.y + cropArea.height - newCropArea.height;

            break;
          case "s":
            newCropArea.height = Math.max(
              minCropSize,
              Math.min(maxCropSize, imageY - cropArea.y)
            );
            newCropArea.width = newCropArea.height; // 1:1 ratio

            break;
          case "e":
            newCropArea.width = Math.max(
              minCropSize,
              Math.min(maxCropSize, imageX - cropArea.x)
            );
            newCropArea.height = newCropArea.width; // 1:1 ratio

            break;
          case "w":
            newCropArea.width = Math.max(
              minCropSize,
              Math.min(maxCropSize, cropArea.x + cropArea.width - imageX)
            );
            newCropArea.height = newCropArea.width; // 1:1 ratio
            newCropArea.x = cropArea.x + cropArea.width - newCropArea.width;

            break;
        }

        // Ensure crop area stays within bounds
        newCropArea.x = Math.max(
          0,
          Math.min(actualImageWidth - newCropArea.width, newCropArea.x)
        );
        newCropArea.y = Math.max(
          0,
          Math.min(actualImageHeight - newCropArea.height, newCropArea.y)
        );

        setCropAreaState(newCropArea);
        setCropArea(newCropArea);
      }
    },
    [
      cropArea,
      isDragging,
      isResizing,
      resizeHandle,
      dragStart,
      aspectRatio,
      minCropSize,
      setCropArea,
      displayDimensions,
      imageRef,
    ]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const cropImage = useCallback(async () => {
    if (!imageRef.current || !canvasRef.current || !cropArea) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Get the actual displayed dimensions of the image element
    const imageElement = imageRef.current;
    const displayWidth = imageElement.clientWidth;
    const displayHeight = imageElement.clientHeight;
    const naturalWidth = imageDimensions.width;
    const naturalHeight = imageDimensions.height;

    // Calculate how the image is actually displayed within the container (object-contain)
    const displayAspect = displayWidth / displayHeight;
    const naturalAspect = naturalWidth / naturalHeight;

    let actualImageWidth, actualImageHeight, offsetX, offsetY;

    if (naturalAspect > displayAspect) {
      // Image is wider than container - limited by width
      actualImageWidth = displayWidth;
      actualImageHeight = displayWidth / naturalAspect;
      offsetX = 0;
      offsetY = (displayHeight - actualImageHeight) / 2;
    } else {
      // Image is taller than container - limited by height
      actualImageHeight = displayHeight;
      actualImageWidth = displayHeight * naturalAspect;
      offsetX = (displayWidth - actualImageWidth) / 2;
      offsetY = 0;
    }

    // Calculate the scale factor from displayed image to natural image
    const scaleToNatural = naturalWidth / actualImageWidth;

    // Convert crop coordinates from display space to natural image space
    const cropXRelativeToImage = cropArea.x - offsetX;
    const cropYRelativeToImage = cropArea.y - offsetY;

    // Ensure crop coordinates are within the actual image bounds
    const clampedCropX = Math.max(
      0,
      Math.min(actualImageWidth - cropArea.width, cropXRelativeToImage)
    );
    const clampedCropY = Math.max(
      0,
      Math.min(actualImageHeight - cropArea.height, cropYRelativeToImage)
    );

    // Convert to natural image coordinates
    const sourceX = clampedCropX * scaleToNatural;
    const sourceY = clampedCropY * scaleToNatural;
    const sourceWidth = cropArea.width * scaleToNatural;
    const sourceHeight = cropArea.height * scaleToNatural;

    // Ensure source coordinates don't exceed natural image bounds
    const finalSourceX = Math.max(
      0,
      Math.min(naturalWidth - sourceWidth, sourceX)
    );
    const finalSourceY = Math.max(
      0,
      Math.min(naturalHeight - sourceHeight, sourceY)
    );
    const finalSourceWidth = Math.min(sourceWidth, naturalWidth - finalSourceX);
    const finalSourceHeight = Math.min(
      sourceHeight,
      naturalHeight - finalSourceY
    );

    // Set canvas size to match the crop area size (maintain 1:1 aspect ratio)
    const outputSize = Math.round(finalSourceWidth);
    canvas.width = outputSize;
    canvas.height = outputSize;

    // Draw the cropped image
    ctx.drawImage(
      imageRef.current,
      finalSourceX,
      finalSourceY,
      finalSourceWidth,
      finalSourceHeight,
      0,
      0,
      outputSize,
      outputSize
    );

    // Convert canvas to blob and create file
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const croppedFile = new File([blob], "cropped-image.jpg", {
            type: "image/jpeg",
          });
          const croppedUrl = URL.createObjectURL(blob);

          setCroppedImage(croppedUrl, croppedFile);
          onCropComplete?.(croppedFile);
          closeCropModal();
        }
      },
      "image/jpeg",
      0.9
    );
  }, [
    cropArea,
    imageDimensions,
    setCroppedImage,
    onCropComplete,
    closeCropModal,
  ]);

  if (!isOpen || !imageUrl) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 "
        onClick={(e) => e.target === e.currentTarget && closeCropModal()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Crop Your Profile Picture
            </h2>
            <button
              onClick={closeCropModal}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Image Container */}
          <div className="p-6">
            <div
              ref={containerRef}
              className="relative mx-auto bg-gray-100 rounded-lg overflow-hidden"
              style={{ width: "400px", height: "400px" }}
            >
              {imageUrl && (
                <img
                  ref={imageRef}
                  src={imageUrl}
                  alt="Crop preview"
                  className="w-full h-full object-contain"
                  onLoad={handleImageLoad}
                  draggable={false}
                />
              )}

              {/* Crop Overlay */}
              {cropArea && imageLoaded && (
                <>
                  {/* Dark overlay */}
                  <div
                    className="absolute inset-0 bg-black/50"
                    style={{
                      clipPath: `polygon(
                        0% 0%, 
                        0% 100%, 
                        ${cropArea.x}px 100%, 
                        ${cropArea.x}px ${cropArea.y}px, 
                        ${cropArea.x + cropArea.width}px ${cropArea.y}px, 
                        ${cropArea.x + cropArea.width}px ${
                        cropArea.y + cropArea.height
                      }px, 
                        ${cropArea.x}px ${cropArea.y + cropArea.height}px, 
                        ${cropArea.x}px 100%, 
                        100% 100%, 
                        100% 0%
                      )`,
                    }}
                  />

                  {/* Crop Area */}
                  <div
                    className="absolute border-2 border-white cursor-move"
                    style={{
                      left: cropArea.x,
                      top: cropArea.y,
                      width: cropArea.width,
                      height: cropArea.height,
                    }}
                    onMouseDown={(e) => handleMouseDown(e)}
                  >
                    {/* Corner Resize Handles */}
                    {["nw", "ne", "sw", "se"].map((handle) => {
                      const getCursorStyle = (handle: string) => {
                        switch (handle) {
                          case "nw":
                            return "nw-resize";
                          case "ne":
                            return "ne-resize";
                          case "sw":
                            return "sw-resize";
                          case "se":
                            return "se-resize";
                          default:
                            return "default";
                        }
                      };

                      return (
                        <div
                          key={handle}
                          className="absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-full hover:bg-blue-50 hover:border-blue-600 transition-colors z-10"
                          style={{
                            [handle.includes("n") ? "top" : "bottom"]: "-8px",
                            [handle.includes("w") ? "left" : "right"]: "-8px",
                            cursor: getCursorStyle(handle),
                          }}
                          onMouseDown={(e) => {
                            handleMouseDown(e, handle);
                          }}
                        />
                      );
                    })}

                    {/* Edge Resize Handles */}
                    {["n", "s", "e", "w"].map((handle) => {
                      const getCursorStyle = (handle: string) => {
                        switch (handle) {
                          case "n":
                            return "n-resize";
                          case "s":
                            return "s-resize";
                          case "e":
                            return "e-resize";
                          case "w":
                            return "w-resize";
                          default:
                            return "default";
                        }
                      };

                      return (
                        <div
                          key={handle}
                          className="absolute bg-white border-2 border-blue-500 hover:bg-blue-50 hover:border-blue-600 transition-colors z-10"
                          style={{
                            ...(handle === "n" && {
                              top: "-4px",
                              left: "50%",
                              transform: "translateX(-50%)",
                              width: "20px",
                              height: "8px",
                              cursor: getCursorStyle(handle),
                            }),
                            ...(handle === "s" && {
                              bottom: "-4px",
                              left: "50%",
                              transform: "translateX(-50%)",
                              width: "20px",
                              height: "8px",
                              cursor: getCursorStyle(handle),
                            }),
                            ...(handle === "e" && {
                              right: "-4px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              width: "8px",
                              height: "20px",
                              cursor: getCursorStyle(handle),
                            }),
                            ...(handle === "w" && {
                              left: "-4px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              width: "8px",
                              height: "20px",
                              cursor: getCursorStyle(handle),
                            }),
                          }}
                          onMouseDown={(e) => {
                            handleMouseDown(e, handle);
                          }}
                        />
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Instructions and Size Info */}
            <div className="mt-4 text-center text-sm text-gray-600">
              <p>Drag to move the crop area or use the handles to resize</p>
              <p className="mt-1">
                A square will be cropped from the center of your selection
              </p>
              <p className="mt-1 text-xs text-blue-600">
                💡 Tip: For wide images, position your crop area to center the
                most important part
              </p>
              {cropArea && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-blue-800">
                        Crop Area:
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-900 rounded">
                        {Math.round(cropArea.width)} ×{" "}
                        {Math.round(cropArea.height)}px
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-blue-800">Output:</span>
                      <span className="px-2 py-1 bg-green-100 text-green-900 rounded">
                        {Math.round(
                          cropArea.width *
                            (imageDimensions.width / displayDimensions.width)
                        )}{" "}
                        ×{" "}
                        {Math.round(
                          cropArea.height *
                            (imageDimensions.width / displayDimensions.width)
                        )}
                        px
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200">
            <button
              onClick={closeCropModal}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={cropImage}
              disabled={!cropArea || !imageLoaded}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Crop Image
            </button>
          </div>
        </motion.div>

        {/* Hidden canvas for cropping */}
        <canvas ref={canvasRef} className="hidden" />
      </motion.div>
    </AnimatePresence>
  );
}
