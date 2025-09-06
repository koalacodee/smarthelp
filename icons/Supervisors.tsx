export default function Supervisors(props: React.SVGProps<SVGSVGElement>) {
  return (
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
      {...props}
    >
      {/* Head */}
      <circle cx="12" cy="7" r="4"></circle>
      {/* Body */}
      <path d="M5.5 21c1-4 5-7 6.5-7s5.5 3 6.5 7"></path>
      {/* Shoulders */}
    </svg>
  );
}
