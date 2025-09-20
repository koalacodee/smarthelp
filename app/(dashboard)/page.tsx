import { Metadata } from "next";

export const revalidate = 1;

export const metadata: Metadata = {
  title: "Dashboard | Task Management System",
  description:
    "Main dashboard for managing tasks, tickets, and team activities",
};

export default async function Home() {
  return <div>Main Page</div>;
}
