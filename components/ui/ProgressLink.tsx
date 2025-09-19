"use client";

import Link from "next/link";
import { useProgressBar } from "@/hooks/useProgressBar";
import { MouseEvent } from "react";

interface ProgressLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
  [key: string]: any;
}

const ProgressLink = ({
  href,
  children,
  onClick,
  ...props
}: ProgressLinkProps) => {
  const { startProgress } = useProgressBar();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // Call the original onClick if provided
    if (onClick) {
      onClick(e);
    }

    // Don't start progress if the click was prevented or if it's an external link
    if (e.defaultPrevented) return;

    const url = new URL(href, window.location.origin);
    const currentUrl = new URL(window.location.href);

    // Only start progress for internal navigation
    if (
      url.origin === currentUrl.origin &&
      url.pathname !== currentUrl.pathname
    ) {
      startProgress();
    }
  };

  return (
    <Link href={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
};

export default ProgressLink;
