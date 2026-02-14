"use client";

import { motion } from "framer-motion";
import Loader2 from "@/icons/Loader2";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import MyDelegationsDelegationCard from "./MyDelegationsDelegationCard";
import type {
  DelegationResponse,
  TaskDelegationSubmissionResponse,
} from "@/services/tasks/types";

interface MyDelegationsListProps {
  delegations: DelegationResponse[];
  submissions: TaskDelegationSubmissionResponse[];
  isLoading: boolean;
}

function groupSubmissionsByDelegationId(
  submissions: TaskDelegationSubmissionResponse[],
): Map<string, TaskDelegationSubmissionResponse[]> {
  const map = new Map<string, TaskDelegationSubmissionResponse[]>();
  for (const sub of submissions) {
    const list = map.get(sub.delegationId) ?? [];
    list.push(sub);
    map.set(sub.delegationId, list);
  }
  return map;
}

export default function MyDelegationsList({
  delegations,
  submissions,
  isLoading,
}: MyDelegationsListProps) {
  const locale = useLocaleStore((s) => s.locale);
  const submissionsByDelegation = groupSubmissionsByDelegationId(submissions);
  const isEmpty = delegations.length === 0;

  if (isLoading && isEmpty) {
    return (
      <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] p-5 flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  if (isEmpty) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.8 }}
        className="px-6 py-16 text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.9 }}
          className="flex flex-col items-center justify-center space-y-4"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, delay: 1, ease: "backOut" }}
            className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center"
          >
            <svg
              className="w-8 h-8 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 1.1 }}
            className="text-slate-500"
          >
            <p className="text-lg font-medium mb-2">
              {locale?.tasks.delegations?.empty?.title ?? "No delegations found"}
            </p>
            <p className="text-sm">
              {locale?.tasks.delegations?.empty?.hint ??
                "Try adjusting your search or filter criteria"}
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {delegations.map((delegation, index) => (
        <motion.div
          key={delegation.id}
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.3,
            delay: 0.8 + index * 0.05,
            ease: "easeOut",
          }}
          whileHover={{ y: -2, transition: { duration: 0.2 } }}
        >
          <MyDelegationsDelegationCard
            delegation={delegation}
            submissions={submissionsByDelegation.get(delegation.id) ?? []}
          />
        </motion.div>
      ))}
    </div>
  );
}
