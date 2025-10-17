import { cookies } from "next/headers";
import { env } from "next-runtime-env";
import AdminDashboard from "./components/admin-dashboard/AdminDashboard";
export const metadata = {
  title: "Main Page | Admin Overview",
  description: "Executive overview of system metrics and actions",
};

export default async function Page() {
  const cookieStore = await cookies();
  const user = await fetch(`${env("NEXT_PUBLIC_BASE_URL")}/server/me`, {
    headers: { Cookie: cookieStore.toString() },
  }).then((res) => {
    return res.json();
  });
  const userRole = user.user.role;

  if (userRole === "ADMIN") {
    return <AdminDashboard />;
  } else {
    return <h1>Main Page</h1>;
  }
}
