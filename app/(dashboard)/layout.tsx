export const dynamic = "force-dynamic";
import Sidebar from "@/components/Sidebar";
import ConfirmationModal from "@/components/ConfirmationModal";
import InitializeUser from "@/components/InitializeUser";
import LogoutButton from "@/components/LogoutButton";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <ConfirmationModal />
      <InitializeUser />
      <div className="min-h-screen bg-muted">
        <div className="flex">
          <Sidebar />
          <div className="flex-1">
            <div className="flex justify-end mb-4 p-4 sm:p-6 lg:p-8">
              <LogoutButton />
            </div>
            <main className="px-4 sm:px-6 lg:px-8 pb-8">
              <div className="h-[calc(100vh-8rem)] overflow-y-auto">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
