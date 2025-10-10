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
    console.log(res);
    return res.json();
  });
  const userRole = user.user.role;
  // Get user's attachments with pagination
  const response = await fetch(
    `${env("NEXT_PUBLIC_API_URL")}/files/my-attachments?limit=20&offset=0`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${cookieStore.get("accessToken")?.value}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json().then((res) => res.data);
  console.log(data);
  console.log("My attachments:", data.attachments);
  console.log("Total count:", data.totalCount);
  console.log("Has more:", data.hasMore);
  console.log("Pagination:", data.pagination);

  if (userRole === "ADMIN") {
    return <AdminDashboard />;
  } else {
    return <h1>Main Page</h1>;
  }
}
