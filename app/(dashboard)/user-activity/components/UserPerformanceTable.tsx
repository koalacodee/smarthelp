"use client";

import React from "react";
import { useLocaleStore } from "@/lib/store/useLocaleStore";

export interface PerformanceUser {
  id: string;
  name: string;
  role: string;
}

export interface PerformanceTicket {
  id: string;
  answeredByUserId?: string;
  customerRating?: "satisfaction" | "dissatisfaction";
  repliedInSeconds: number;
}

type UserRole = "ADMIN" | "SUPERVISOR" | "EMPLOYEE";

interface PerformanceStats {
  name: string;
  role: UserRole;
  answered: number;
  satisfied: number;
  dissatisfied: number;
  satisfactionRate: number;
  avgResponseTime: number;
}

interface UserPerformanceTableProps {
  users: PerformanceUser[];
  tickets: PerformanceTicket[];
}

const formatResponseTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  } else if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  } else {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    return `${days}d ${hours}h`;
  }
};

const UserPerformanceTable: React.FC<UserPerformanceTableProps> = ({
  users,
  tickets,
}) => {
  const locale = useLocaleStore((state) => state.locale);

  if (!locale) return null;

  // Static calculation of performance data
  const performanceData: PerformanceStats[] = React.useMemo(() => {
    const userStats: Record<
      string,
      {
        name: string;
        role: UserRole;
        answered: number;
        satisfied: number;
        dissatisfied: number;
        totalResponseTime: number;
      }
    > = {};

    for (const user of users) {
      userStats[user.id] = {
        name: user.name,
        role: user.role as UserRole,
        answered: 0,
        satisfied: 0,
        dissatisfied: 0,
        totalResponseTime: 0,
      };
    }

    for (const ticket of tickets) {
      if (ticket.answeredByUserId && userStats[ticket.answeredByUserId]) {
        userStats[ticket.answeredByUserId].answered++;
        userStats[ticket.answeredByUserId].totalResponseTime +=
          ticket.repliedInSeconds;
        if (ticket.customerRating === "satisfaction") {
          userStats[ticket.answeredByUserId].satisfied++;
        } else if (ticket.customerRating === "dissatisfaction") {
          userStats[ticket.answeredByUserId].dissatisfied++;
        }
      }
    }

    return Object.values(userStats)
      .filter((stats) => stats.answered > 0)
      .map((stats) => {
        const totalRatings = stats.satisfied + stats.dissatisfied;
        const satisfactionRate =
          totalRatings > 0 ? (stats.satisfied / totalRatings) * 100 : 0;
        const avgResponseTime =
          stats.answered > 0 ? stats.totalResponseTime / stats.answered : 0;
        return {
          ...stats,
          satisfactionRate,
          avgResponseTime: Math.round(avgResponseTime),
        };
      })
      .sort((a, b) => b.answered - a.answered);
  }, [users, tickets]);

  if (performanceData.length === 0) {
    return (
      <p className="text-center py-8 text-slate-500 italic">
        {locale.userActivity.performanceTable.empty}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="bg-white/70  rounded-2xl border border-slate-200/50 shadow-sm">
        <table className="min-w-full">
          <thead className="bg-gradient-to-r from-slate-50/80 to-slate-100/50">
            <tr>
              <th
                scope="col"
                className="px-8 py-5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
              >
                {locale.userActivity.performanceTable.columns.user}
              </th>
              <th
                scope="col"
                className="px-8 py-5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
              >
                {locale.userActivity.performanceTable.columns.role}
              </th>
              <th
                scope="col"
                className="px-8 py-5 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider"
              >
                {locale.userActivity.performanceTable.columns.answered}
              </th>
              <th
                scope="col"
                className="px-8 py-5 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider"
              >
                {locale.userActivity.performanceTable.columns.satisfied}
              </th>
              <th
                scope="col"
                className="px-8 py-5 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider"
              >
                {locale.userActivity.performanceTable.columns.dissatisfied}
              </th>
              <th
                scope="col"
                className="px-8 py-5 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider"
              >
                {locale.userActivity.performanceTable.columns.avgResponseTime}
              </th>
              <th
                scope="col"
                className="px-8 py-5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
              >
                {locale.userActivity.performanceTable.columns.satisfactionRate}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/50">
            {performanceData.map((stat, index) => (
              <tr
                key={stat.name}
                className="hover:bg-slate-50/50 transition-colors duration-200 group"
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <td className="px-8 py-5 whitespace-nowrap text-sm font-semibold text-slate-900 group-hover:text-slate-800">
                  {stat.name}
                </td>
                <td className="px-8 py-5 whitespace-nowrap text-sm text-slate-600 capitalize">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      stat.role === "ADMIN"
                        ? "bg-purple-100 text-purple-800"
                        : stat.role === "SUPERVISOR"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {stat.role}
                  </span>
                </td>
                <td className="px-8 py-5 whitespace-nowrap text-sm text-slate-700 text-center font-bold">
                  {stat.answered}
                </td>
                <td className="px-8 py-5 whitespace-nowrap text-sm text-green-600 text-center font-bold">
                  {stat.satisfied}
                </td>
                <td className="px-8 py-5 whitespace-nowrap text-sm text-red-600 text-center font-bold">
                  {stat.dissatisfied}
                </td>
                <td className="px-8 py-5 whitespace-nowrap text-sm text-slate-600 text-center">
                  <span className="font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-full">
                    {formatResponseTime(stat.avgResponseTime)}
                  </span>
                </td>
                <td className="px-8 py-5 whitespace-nowrap text-sm text-slate-600">
                  <div className="flex items-center gap-3">
                    <div className="w-full bg-slate-200 rounded-full h-3 shadow-inner">
                      <div
                        className={`h-3 rounded-full shadow-sm transition-all duration-300 ${
                          stat.satisfactionRate >= 75
                            ? "bg-gradient-to-r from-green-400 to-green-600"
                            : stat.satisfactionRate >= 50
                            ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                            : "bg-gradient-to-r from-red-400 to-red-600"
                        }`}
                        style={{ width: `${stat.satisfactionRate}%` }}
                      ></div>
                    </div>
                    <span className="font-bold text-slate-800 w-12 text-right">
                      {stat.satisfactionRate.toFixed(0)}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserPerformanceTable;
