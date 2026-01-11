import { Metadata } from "next";
import api, { DepartmentsService, SupervisorsService } from "@/lib/api/index";
import SupervisorsPageClient from "./components/SupervisorsPageClient";
import { SupervisorInvitationService } from "@/lib/api/v2";
import { getLocale, getLanguage } from "@/locales/helpers";

export const metadata: Metadata = {
  title: "Supervisors | Team Management",
  description:
    "Manage supervisors, assign permissions, and oversee team operations",
};

export default async function Page() {
  const supervisors = await SupervisorsService.getSupervisors();
  const invitationsResponse =
    await SupervisorInvitationService.getInvitations();
  const departments = await DepartmentsService.getAllDepartments();

  const [locale, language] = await Promise.all([
    getLocale(),
    getLanguage(),
  ]);

  return (
    <SupervisorsPageClient
      initialSupervisors={supervisors}
      initialInvitations={invitationsResponse.invitations || []}
      departments={departments}
      locale={locale}
      language={language}
    />
  );
}
