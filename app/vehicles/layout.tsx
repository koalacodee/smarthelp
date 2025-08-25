import SubTabs from "./components/SubTabs";

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
            <SubTabs />
          </nav>
        </div>
      </div>
      <div className="animate-fade-in">{children}</div>
    </div>
  );
}
