import React from "react";

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
        No ticket performance data available yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto border border-slate-200 rounded-lg">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-100">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
            >
              User
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
            >
              Role
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider"
            >
              Answered
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider"
            >
              Satisfied 👍
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider"
            >
              Dissatisfied 👎
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider"
            >
              Avg Response Time
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
            >
              Satisfaction Rate
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {performanceData.map((stat) => (
            <tr key={stat.name} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                {stat.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 capitalize">
                {stat.role}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-center font-semibold">
                {stat.answered}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 text-center font-semibold">
                {stat.satisfied}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 text-center font-semibold">
                {stat.dissatisfied}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-center">
                <span className="font-semibold">
                  {formatResponseTime(stat.avgResponseTime)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div
                      className={`${
                        stat.satisfactionRate >= 75
                          ? "bg-green-500"
                          : stat.satisfactionRate >= 50
                          ? "bg-yellow-400"
                          : "bg-red-500"
                      } h-2.5 rounded-full`}
                      style={{ width: `${stat.satisfactionRate}%` }}
                    ></div>
                  </div>
                  <span className="font-semibold text-slate-700 w-12 text-right">
                    {stat.satisfactionRate.toFixed(0)}%
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserPerformanceTable;
