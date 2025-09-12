import Briefcase from "@/icons/Briefcase";
import SubTabs from "../../../components/ui/SubTabs";
import ClipboardList from "@/icons/ClipboardList";
import User from "@/icons/User";

const navItems = [
  {
    label: "Fleet Management",
    href: "/vehicles",
    icon: <Briefcase className="w-5 h-5" />,
  },
  {
    label: "Licensing",
    href: "/vehicles/licensing",
    icon: <ClipboardList className="w-5 h-5" />,
  },
  {
    label: "Drivers & Tracking",
    href: "/vehicles/drivers",
    icon: <User className="w-5 h-5" />,
  },
];

export default function VehiclePageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="border-b border-slate-200">
          <nav className="-mb-px flex space-x-4" aria-label="Tabs">
            <SubTabs tabs={navItems} />
          </nav>
        </div>
      </div>
      <div className="animate-fade-in">{children}</div>
    </div>
  );
}
