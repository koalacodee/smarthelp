import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Metadata } from "next";
import { TaskDelegationService } from "@/lib/api/v2";
import MyDelegationsPageClient from "./components/MyDelegationsPageClient";
import { env } from "next-runtime-env";

export const metadata: Metadata = {
  title: "My Delegations | Task Management System",
  description: "View and manage your task delegations",
};

export default async function Page() {
  const cookieStore = await cookies();

  const user = await fetch(`${env("NEXT_PUBLIC_BASE_URL")}/server/me`, {
    headers: { Cookie: cookieStore.toString() },
  }).then((res) => {
    return res.json();
  });
  const userRole = user.user.role;

  // Only supervisors can access this page
  if (userRole !== "SUPERVISOR") {
    return redirect("/tasks");
  }

  // Fetch delegations
  const delegationsData = await TaskDelegationService.getMyDelegations({});

  console.log(delegationsData);


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">My Delegations</h2>
      </div>

      <MyDelegationsPageClient
        initialDelegations={delegationsData.delegations}
        initialSubmissions={delegationsData.submissions}
        initialAttachments={delegationsData.attachments}
        initialDelegationSubmissionAttachments={delegationsData.delegationSubmissionAttachments}
        initialTotal={delegationsData.total}
      />
    </div>
  );
}

