"use client";
import { useUserStore } from "@/app/(dashboard)/store/useUserStore";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useToastStore } from "@/app/(dashboard)/store/useToastStore";
import { useRejectionModalStore } from "@/app/(dashboard)/store/useRejectionModalStore";
import RejectionModal from "./RejectionModal";
import { Datum } from "@/lib/api/employee-requests";

export default function AdminPage() {
  const { user } = useUserStore();
  const { addToast } = useToastStore();
  const [pendingRequests, setPendingRequests] = useState<Datum[]>([]);
  const [resolvedRequests, setResolvedRequests] = useState<Datum[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === "ADMIN") {
      fetchRequests();
    }
  }, [user?.role]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const [pending, resolved] = await Promise.all([
        api.EmployeeRequestsService.getPendingEmployeeRequests(),
        api.EmployeeRequestsService.getResolvedEmployeeRequests(),
      ]);
      setPendingRequests(pending || []);
      setResolvedRequests(resolved || []);
    } catch (error) {
      addToast({ message: "Failed to fetch requests", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.EmployeeRequestsService.approveEmployeeRequest(id);
      addToast({ message: "Request approved successfully", type: "success" });
      fetchRequests();
    } catch (error) {
      addToast({ message: "Failed to approve request", type: "error" });
      console.log(error);
    }
  };

  const rejectionModal = useRejectionModalStore();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      {user?.role === "ADMIN" && (
        <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold text-slate-800 mb-4">
              Pending Employee Requests ({pendingRequests.length})
            </h3>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              {loading ? (
                <div className="text-center py-10 text-slate-500">
                  Loading...
                </div>
              ) : (
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        User Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Requested By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {pendingRequests.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="text-center py-10 text-slate-500 italic"
                        >
                          No pending requests
                        </td>
                      </tr>
                    ) : (
                      pendingRequests.map((request) => (
                        <tr key={request.id}>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-slate-900">
                              {request.newEmployeeFullName}
                            </div>
                            <div className="text-sm text-slate-500">
                              {request.newEmployeeJobTitle} -{" "}
                              {request.newEmployeeId}
                            </div>
                            <div className="text-sm text-slate-500">
                              {request?.newEmployeeEmail?.value}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            {request?.requestedBySupervisor?.user?.username ||
                              "Unknown"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            {request?.createdAt &&
                              formatDate(request.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleApprove(request.id)}
                              className="text-green-600 hover:text-green-900 mr-3"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() =>
                                rejectionModal.openModal(
                                  request.id,
                                  request.newEmployeeFullName || "Employee"
                                )
                              }
                              className="text-red-600 hover:text-red-900"
                            >
                              Reject
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold text-slate-800 mb-4">
              Resolved Requests ({resolvedRequests.length})
            </h3>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              {loading ? (
                <div className="text-center py-10 text-slate-500">
                  Loading...
                </div>
              ) : (
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        User Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Resolved By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {resolvedRequests.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="text-center py-10 text-slate-500 italic"
                        >
                          No resolved requests
                        </td>
                      </tr>
                    ) : (
                      resolvedRequests.map((request) => (
                        <tr key={request.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                request.status === "APPROVED"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {request?.status?.toLowerCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-slate-900">
                              {request.newEmployeeFullName}
                            </div>
                            <div className="text-sm text-slate-500">
                              {request.newEmployeeJobTitle} -{" "}
                              {request.newEmployeeId}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            {request?.resolvedByAdmin?.user?.username ||
                              "Unknown"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            {request?.rejectionReason
                              ? request?.rejectionReason
                              : request?.resolvedAt
                              ? formatDate(request.resolvedAt)
                              : null}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      <RejectionModal />
    </>
  );
}
