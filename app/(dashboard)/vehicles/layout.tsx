export default function VehiclePageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="animate-fade-in">{children}</div>
    </div>
  );
}
