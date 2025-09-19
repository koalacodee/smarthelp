"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

// Configure NProgress
NProgress.configure({
  showSpinner: false,
  speed: 200,
  minimum: 0.1,
});

let progressInterval: ReturnType<typeof setInterval> | null = null;
let isNavigating = false;

const ProgressBar = () => {
  const pathname = usePathname();

  useEffect(() => {
    const startProgress = () => {
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
    };

    const completeProgress = () => {
      isNavigating = false;

      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      NProgress.done();
    };

    // Intercept link clicks
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a[href]") as HTMLAnchorElement;

      if (
        link &&
        link.href &&
        !link.href.startsWith("mailto:") &&
        !link.href.startsWith("tel:")
      ) {
        const url = new URL(link.href);
        const currentUrl = new URL(window.location.href);

        // Only start progress for internal navigation
        if (
          url.origin === currentUrl.origin &&
          url.pathname !== currentUrl.pathname
        ) {
          startProgress();
        }
      }
    };

    // Intercept browser back/forward buttons
    const handlePopState = () => {
      startProgress();
    };

    // Listen for navigation events
    document.addEventListener("click", handleLinkClick);
    window.addEventListener("popstate", handlePopState);

    // Complete progress when page is fully loaded
    const handleLoad = () => {
      completeProgress();
    };

    window.addEventListener("load", handleLoad);

    // Cleanup
    return () => {
      document.removeEventListener("click", handleLinkClick);
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("load", handleLoad);

      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      isNavigating = false;
    };
  }, []);

  // Complete progress when pathname changes (page loaded)
  useEffect(() => {
    if (isNavigating) {
      // Small delay to ensure the page has actually loaded
      const timeoutId = setTimeout(() => {
        isNavigating = false;
        if (progressInterval) {
          clearInterval(progressInterval);
          progressInterval = null;
        }
        NProgress.done();
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [pathname]);

  return null;
};

export default ProgressBar;
