import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sub-Departments | Organization Management",
  description:
    "Manage sub-departments, create and edit sub-department structures within departments",
};

export default function SubDepartmentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
