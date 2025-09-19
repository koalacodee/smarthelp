"use client";

import { useRouter } from "next/navigation";
import { useProgressBar } from "./useProgressBar";

export const useProgressRouter = () => {
  const router = useRouter();
  const { startProgress } = useProgressBar();

  const push = (href: string) => {
    startProgress();
    router.push(href);
  };

  const replace = (href: string) => {
    startProgress();
    router.replace(href);
  };

  const back = () => {
    startProgress();
    router.back();
  };

  const forward = () => {
    startProgress();
    router.forward();
  };

  const refresh = () => {
    startProgress();
    router.refresh();
  };

  return {
    push,
    replace,
    back,
    forward,
    refresh,
  };
};
