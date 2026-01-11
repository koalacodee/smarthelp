import { Metadata } from "next";
import { cookies } from "next/headers";
import { env } from "next-runtime-env";
import { DepartmentsService } from "@/lib/api";
import { KnowledgeChunkService } from "@/lib/api/v2";
import { KnowledgeChunk } from "@/lib/api/v2/services/knowledge-chunks";
import CategoriesClient from "./components/CategoriesClient";
import PageHeader from "./components/PageHeader";
import AddButton from "./components/AddButton";
import { getLocale, getLanguage } from "@/locales/helpers";

export const metadata: Metadata = {
  title: "Categories | Organization Management",
  description: "Manage organizational categories and sub-categories",
};

async function getUser() {
  const cookieStore = await cookies();
  const res = await fetch(`${env("NEXT_PUBLIC_BASE_URL")}/server/me`, {
    headers: { Cookie: cookieStore.toString() },
  });
  const data = await res.json();
  return data.user;
}

export default async function CategoriesPage() {
  const user = await getUser();
  const isAdmin = user.role === "ADMIN";

  const [categories, subCategories, groupedChunks, locale, language] = await Promise.all([
    isAdmin ? DepartmentsService.getAllDepartments() : Promise.resolve([]),
    DepartmentsService.getAllSubDepartments(),
    KnowledgeChunkService.getGroupedKnowledgeChunks(),
    getLocale(),
    getLanguage(),
  ]);

  const knowledgeChunks = groupedChunks.reduce((acc, item) => {
    acc[item.departmentId] = item.knowledgeChunks;
    return acc;
  }, {} as Record<string, KnowledgeChunk[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
        <PageHeader
          title={isAdmin ? locale.categories.pageHeader.titleAdmin : locale.categories.pageHeader.titleNonAdmin}
          description={locale.categories.pageHeader.description}
        />

        <CategoriesClient
          initialCategories={categories}
          initialSubCategories={subCategories}
          initialKnowledgeChunks={knowledgeChunks}
          userRole={user.role}
          locale={locale}
          language={language}
        />
      </div>

      {user.role !== "EMPLOYEE" && <AddButton userRole={user.role} />}
    </div>
  );
}
