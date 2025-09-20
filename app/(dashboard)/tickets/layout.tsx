import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tickets | Support Management System",
  description:
    "Manage customer support tickets, track responses, and monitor ticket metrics",
};

export default function TicketsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
