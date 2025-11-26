import * as React from "react";

export default function AttachmentClip(
  props: React.SVGProps<SVGSVGElement>
) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.172 7 6.586 15.586a2 2 0 0 0 2.828 2.828l8.586-8.586a4 4 0 1 0-5.657-5.657L3.929 12.586a6 6 0 1 0 8.485 8.485L20.5 12"
      />
    </svg>
  );
}


