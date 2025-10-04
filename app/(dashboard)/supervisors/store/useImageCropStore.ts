import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageCropState {
  isOpen: boolean;
  imageFile: File | null;
  imageUrl: string | null;
  cropArea: CropArea | null;
  croppedImageUrl: string | null;
  croppedImageFile: File | null;
  aspectRatio: number;
  minCropSize: number;

  // Actions
  openCropModal: (file: File) => void;
  closeCropModal: () => void;
  setCropArea: (cropArea: CropArea) => void;
  setCroppedImage: (imageUrl: string, imageFile: File) => void;
  resetCrop: () => void;
  setAspectRatio: (ratio: number) => void;
  setMinCropSize: (size: number) => void;
}

export const useImageCropStore = create<ImageCropState>()(
  persist(
    (set, get) => ({
      isOpen: false,
      imageFile: null,
      imageUrl: null,
      cropArea: null,
      croppedImageUrl: null,
      croppedImageFile: null,
      aspectRatio: 1, // 1:1 square by default
      minCropSize: 100, // Minimum crop size in pixels

      openCropModal: (file: File) => {
        const imageUrl = URL.createObjectURL(file);
        set({
          isOpen: true,
          imageFile: file,
          imageUrl,
          cropArea: null,
          croppedImageUrl: null,
          croppedImageFile: null,
        });
      },

      closeCropModal: () => {
        const { imageUrl } = get();
        if (imageUrl) {
          URL.revokeObjectURL(imageUrl);
        }
        set({
          isOpen: false,
          imageFile: null,
          imageUrl: null,
          cropArea: null,
        });
      },

      setCropArea: (cropArea: CropArea) => {
        set({ cropArea });
      },

      setCroppedImage: (imageUrl: string, imageFile: File) => {
        const { croppedImageUrl: oldUrl } = get();
        if (oldUrl) {
          URL.revokeObjectURL(oldUrl);
        }
        set({
          croppedImageUrl: imageUrl,
          croppedImageFile: imageFile,
        });
      },

      resetCrop: () => {
        const { imageUrl, croppedImageUrl } = get();
        if (imageUrl) {
          URL.revokeObjectURL(imageUrl);
        }
        if (croppedImageUrl) {
          URL.revokeObjectURL(croppedImageUrl);
        }
        set({
          isOpen: false,
          imageFile: null,
          imageUrl: null,
          cropArea: null,
          croppedImageUrl: null,
          croppedImageFile: null,
        });
      },

      setAspectRatio: (ratio: number) => {
        set({ aspectRatio: ratio });
      },

      setMinCropSize: (size: number) => {
        set({ minCropSize: size });
      },
    }),
    {
      name: "image-crop-store",
      partialize: (state) => ({
        aspectRatio: state.aspectRatio,
        minCropSize: state.minCropSize,
      }),
    }
  )
);
