import { Metadata } from "next";
import { SupervisorsService } from "@/lib/api/index";
import SupervisorsPageClient from "./components/SupervisorsPageClient";

export const metadata: Metadata = {
  title: "Supervisors | Team Management",
  description:
    "Manage supervisors, assign permissions, and oversee team operations",
};

export default async function Page() {
  const supervisors = await SupervisorsService.getSupervisors();

  return <SupervisorsPageClient initialSupervisors={supervisors} />;
}
