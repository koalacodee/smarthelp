"use client";

import { useCallback } from "react";
import NProgress from "nprogress";

let progressInterval: ReturnType<typeof setInterval> | null = null;
let isNavigating = false;

export const useProgressBar = () => {
  const startProgress = useCallback(() => {
    if (isNavigating) return; // Prevent multiple starts

    isNavigating = true;

    // Clear any existing interval
    if (progressInterval) {
      clearInterval(progressInterval);
    }

    // Reset and start progress
    NProgress.set(0.1); // Start at 10%

    // Create realistic progress simulation
    progressInterval = setInterval(() => {
      const currentProgress = NProgress.status;

      if (currentProgress && currentProgress < 0.8) {
        // Random increment between 0.02 and 0.08 (2% to 8%)
        const increment = Math.random() * 0.06 + 0.02;
        const newProgress = Math.min(currentProgress + increment, 0.8);
        NProgress.set(newProgress);
      } else {
        // Stop at 80% and wait for actual page load
        if (progressInterval) {
          clearInterval(progressInterval);
          progressInterval = null;
        }
      }
    }, Math.random() * 200 + 100); // Random interval between 100-300ms
  }, []);

  const completeProgress = useCallback(() => {
    isNavigating = false;

    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }
    NProgress.done();
  }, []);

  return { startProgress, completeProgress };
};
