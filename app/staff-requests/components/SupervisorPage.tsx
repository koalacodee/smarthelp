"use client";
import { useUserStore } from "@/app/store/useUserStore";
import { useEmployeeRequestsStore } from "@/app/store/useEmployeeRequestsStore";
import { useEffect } from "react";
import SubmitEmployeeRequestForm from "./SubmitEmployeeRequestForm";
import CreateNewDriverForm from "./CreateNewDriverForm";
import api from "@/lib/api";

export default function SupervisorPage() {
  const { user } = useUserStore();
  const { requests, isLoading, error, setRequests, setLoading, setError } =
    useEmployeeRequestsStore();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch employee requests for the current supervisor
        const response =
          await api.EmployeeRequestsService.getEmployeeRequestsForSupervisor(
            user?.id || ""
          );
        setRequests(response || []);
      } catch (err) {
        setError("Failed to fetch requests");
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "SUPERVISOR") {
      fetchRequests();
    }
  }, [user?.role, setRequests, setLoading, setError]);

  return (
    <>
      {user?.role === "SUPERVISOR" && (
        <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-8 min-h-screen h-screen overflow-y-auto">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold text-slate-800">
              Request New Employee Account
            </h3>
            <p className="text-sm text-slate-600 mt-1 mb-4">
              Submit a request to create a new employee account. The new user
              will be assigned to your same categories upon approval by an
              admin.
            </p>
            <SubmitEmployeeRequestForm />
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold text-slate-800">Add New Driver</h3>
            <p className="text-sm text-slate-600 mt-1 mb-4">
              Directly create a new driver account. The driver will be assigned
              to your team.
            </p>
            <CreateNewDriverForm />
          </div>
          <div className="bg-white p-6 rounded-lg shadow mb-12">
            <h3 className="text-xl font-bold text-slate-800 mb-4">
              Your Past Requests
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-slate-200 min-w-[600px]">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Username
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Designation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Employee ID
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-8 text-center text-slate-500"
                      >
                        Loading your requests...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-8 text-center text-red-600"
                      >
                        {error}
                      </td>
                    </tr>
                  ) : requests.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-8 text-center text-slate-500"
                      >
                        No requests found.
                      </td>
                    </tr>
                  ) : (
                    requests.map((request) => (
                      <tr key={request.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              request.status === "APPROVED"
                                ? "bg-green-100 text-green-800"
                                : request.status === "REJECTED"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {request.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          {request.newEmployeeUsername}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          {request.newEmployeeJobTitle}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          {request.newEmployeeId}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
