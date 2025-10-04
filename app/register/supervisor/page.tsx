import { SupervisorInvitationService } from "@/lib/api/v2";
import SupervisorRegistrationForm from "./components/SupervisorRegistrationForm";
import AnimatedErrorPage from "./components/AnimatedErrorPage";

interface SupervisorRegistrationPageProps {
  searchParams: {
    token?: string;
  };
}

export default async function SupervisorRegistrationPage({
  searchParams,
}: SupervisorRegistrationPageProps) {
  const { token } = searchParams;

  // Check if token exists
  if (!token) {
    return (
      <AnimatedErrorPage
        title="Invalid Invitation"
        message="Missing invitation token"
      />
    );
  }

  let invitation: any;

  try {
    // Fetch invitation data on server side
    invitation = await SupervisorInvitationService.getInvitation({ token });
    console.log(invitation);
  } catch (error: any) {
    console.error("Failed to fetch invitation:", error);

    // Return error page for invalid/expired tokens
    return (
      <AnimatedErrorPage
        title="Invalid Invitation"
        message="This invitation is invalid or has expired"
      />
    );
  }

  // Pass invitation data to client component
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6">
      <div className="max-w-4xl mx-auto">
        <SupervisorRegistrationForm invitation={invitation} token={token} />
      </div>
    </div>
  );
}
