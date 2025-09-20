import { Metadata } from "next";
import AdminPage from "./components/AdminPage";
import SupervisorPage from "./components/SupervisorPage";

export const metadata: Metadata = {
  title: "Staff Requests | HR Management",
  description:
    "Manage staff requests, handle employee requests, and process HR-related requests",
};

export default function Page() {
  return (
    <>
      <AdminPage />
      <SupervisorPage />
    </>
  );
}
