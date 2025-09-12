import { cookies } from "next/headers";
import SubTabs from "../../../components/ui/SubTabs";
import CheckCircle from "@/icons/CheckCircle";
type UserRole = "EMPLOYEE" | "ADMIN" | "SUPERVISOR";

const navItems = [
  {
    label: "Team Tasks",
    href: "/tasks",
    icon: <CheckCircle className="w-5 h-5" />,
  },
  {
    label: "My Tasks",
    href: "/tasks/my-tasks",
    icon: <CheckCircle className="w-5 h-5" />,
  },
];

export default async function TaskLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const userRole = cookieStore.get("user-role")?.value as UserRole | undefined;

  return (
    <div className="space-y-6">
      {userRole === "SUPERVISOR" && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="border-b border-slate-200">
            <nav className="-mb-px flex space-x-4" aria-label="Tabs">
              <SubTabs tabs={navItems} />
            </nav>
          </div>
        </div>
      )}
      <div className="animate-fade-in">{children}</div>
    </div>
  );
}
