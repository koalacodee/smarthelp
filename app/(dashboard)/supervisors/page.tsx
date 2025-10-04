import { Metadata } from "next";
import api, { SupervisorsService } from "@/lib/api/index";
import SupervisorsPageClient from "./components/SupervisorsPageClient";
import { SupervisorInvitationService } from "@/lib/api/v2";

export const metadata: Metadata = {
  title: "Supervisors | Team Management",
  description:
    "Manage supervisors, assign permissions, and oversee team operations",
};

export default async function Page() {
  const supervisors = await SupervisorsService.getSupervisors();
  const invitationsResponse =
    await SupervisorInvitationService.getInvitations();
  console.log(invitationsResponse);
  return (
    <SupervisorsPageClient
      initialSupervisors={supervisors}
      initialInvitations={invitationsResponse.invitations || []}
    />
  );
}
