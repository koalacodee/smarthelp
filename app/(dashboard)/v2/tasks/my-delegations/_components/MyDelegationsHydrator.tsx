"use client";

import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import { useV2TaskPageStore } from "../../_store/use-v2-task-page-store";
import MyDelegationsHeader from "./MyDelegationsHeader";
import MyDelegationsDashboard from "./MyDelegationsDashboard";
import MyDelegationsFilters from "./MyDelegationsFilters";
import MyDelegationsList from "./MyDelegationsList";
import TaskPagination from "../../_components/TaskPagination";
import { useMyDelegations } from "@/services/tasks";
import { useTaskStore } from "@/services/tasks/store";
import TaskDetailModal from "../../_components/modals/TaskDetailModal";
import ForwardDelegationModal from "../../_components/modals/ForwardDelegationModal";
import ApproveSubmissionModal from "../../_components/modals/ApproveSubmissionModal";
import RejectSubmissionModal from "../../_components/modals/RejectSubmissionModal";
import type { Locale } from "@/locales/type";
import type { DelegationResponse } from "@/services/tasks/types";

interface MyDelegationsHydratorProps {
  locale: Locale;
  language: string;
}

function filterDelegations(
  delegations: DelegationResponse[],
  search?: string,
  priority?: string,
): DelegationResponse[] {
  let result = delegations;
  if (search?.trim()) {
    const q = search.trim().toLowerCase();
    result = result.filter((d) => {
      const title = d.task?.title?.toLowerCase() ?? "";
      const desc = d.task?.description?.toLowerCase() ?? "";
      return title.includes(q) || desc.includes(q);
    });
  }
  if (priority) {
    result = result.filter((d) => (d.task?.priority ?? "").toUpperCase() === priority.toUpperCase());
  }
  return result;
}

export default function MyDelegationsHydrator({
  locale,
  language,
}: MyDelegationsHydratorProps) {
  const { setLocale } = useLocaleStore();
  const { cursor, direction, resetCursor } = useV2TaskPageStore();
  const { activeFilters } = useTaskStore();

  useEffect(() => {
    setLocale(locale, language);
    resetCursor();
  }, []);

  const myDelegationsQuery = useMyDelegations({
    status: activeFilters.status,
    cursor,
    direction,
    pageSize: 10,
  });

  const meta = myDelegationsQuery.data?.meta;
  const rawDelegations = myDelegationsQuery.data?.data?.delegations ?? [];
  const submissions = myDelegationsQuery.data?.data?.submissions ?? [];

  const filteredDelegations = useMemo(
    () =>
      filterDelegations(
        rawDelegations,
        activeFilters.search,
        activeFilters.priority,
      ),
    [rawDelegations, activeFilters.search, activeFilters.priority],
  );

  const completedCount = filteredDelegations.filter(
    (d) => d.status === "COMPLETED",
  ).length;
  const pendingCount = filteredDelegations.filter(
    (d) => d.status === "TODO" || d.status === "PENDING_REVIEW",
  ).length;
  const completionPercentage =
    filteredDelegations.length === 0
      ? 0
      : Math.round((completedCount / filteredDelegations.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <MyDelegationsHeader delegationCount={filteredDelegations.length} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-[1fr_3fr] gap-8"
        >
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className="bg-white/90 rounded-2xl shadow-xl border border-white/20 p-6"
            >
              <MyDelegationsDashboard
                total={filteredDelegations.length}
                completedCount={completedCount}
                pendingCount={pendingCount}
                completionPercentage={completionPercentage}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className="bg-white/90 rounded-2xl shadow-xl border border-white/20 p-6"
            >
              <MyDelegationsFilters />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            className="bg-white/90 rounded-2xl shadow-xl border border-white/20 p-6"
          >
            <MyDelegationsList
              delegations={filteredDelegations}
              submissions={submissions}
              isLoading={
                myDelegationsQuery.isLoading || myDelegationsQuery.isFetching
              }
            />
            <TaskPagination meta={meta} />
          </motion.div>
        </motion.div>
      </div>

      <TaskDetailModal />
      <ForwardDelegationModal />
      <ApproveSubmissionModal />
      <RejectSubmissionModal />
    </motion.div>
  );
}
