"use client";

import { useState, useEffect } from "react";
import SupervisorEditModal from "./SupervisorEditModal";
import SupervisorsTable from "./SupervisorsTable";
import { useSupervisorStore } from "@/lib/store/useSupervisorStore";
import { useCurrentEditingSupervisorStore } from "../store/useCurrentEditingSupervisorStore";
import { useSupervisorInvitationsStore } from "../store/useSupervisorInvitationsStore";
import { SupervisorsService } from "@/lib/api/index";
import { SupervisorInvitationStatus } from "@/lib/api/v2/services/supervisor";

interface SupervisorsPageClientProps {
  initialSupervisors: any[];
  initialInvitations: SupervisorInvitationStatus[];
}

export default function SupervisorsPageClient({
  initialSupervisors,
  initialInvitations,
}: SupervisorsPageClientProps) {
  const { entities: supervisors, setEntities: setSupervisors } =
    useSupervisorStore();
  const { invitations, setInvitations } = useSupervisorInvitationsStore();
  const { setSupervisor, setIsEditing, isEditing } =
    useCurrentEditingSupervisorStore();
  const [searchTerm, setSearchTerm] = useState("");

  // Initialize with server data
  useEffect(() => {
    setSupervisors(initialSupervisors);
    setInvitations(initialInvitations);
  }, [initialSupervisors, setSupervisors, initialInvitations, setInvitations]);

  const refreshSupervisors = () => {
    SupervisorsService.getSupervisors()
      .then((data) => {
        setSupervisors(data);
      })
      .catch((error) => {
        console.error("Failed to fetch supervisors:", error);
      });
  };

  const filteredSupervisors = supervisors.filter(
    (supervisor) =>
      supervisor.user.username
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      supervisor.user.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supervisor.user?.employeeId
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      supervisor.user?.jobTitle
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-slate-800">Manage Supervisors</h3>
        <button
          onClick={() => {
            setIsEditing(true);
            setSupervisor(null);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium cursor-pointer hover:bg-blue-700"
        >
          Invite New Supervisor
        </button>
      </div>

      <div className="mb-4">
        <label htmlFor="supervisor-search" className="sr-only">
          Search Supervisors
        </label>
        <div className="relative w-full md:w-1/2">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-5 w-5 text-slate-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
          </div>
          <input
            id="supervisor-search"
            placeholder="Search by username or Employee ID..."
            className="block w-full rounded-md border-slate-300 bg-white py-2 pl-10 pr-3 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:text-slate-900 focus:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <SupervisorsTable supervisors={filteredSupervisors} />

      {/* Invitations Section */}
      {invitations.length > 0 && (
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-slate-800 mb-4">
            Pending Invitations ({invitations.length})
          </h4>
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="space-y-3">
              {invitations.map((invitation) => (
                <div
                  key={invitation.token}
                  className="flex items-center justify-between bg-white p-3 rounded-md border border-slate-200"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium text-slate-900">
                          {invitation.name}
                        </p>
                        <p className="text-sm text-slate-600">
                          {invitation.email}
                        </p>
                      </div>
                      <div className="text-sm text-slate-500">
                        <p>Job Title: {invitation.jobTitle}</p>
                        <p>
                          Departments: {invitation.departmentNames.join(", ")}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        invitation.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : invitation.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {invitation.status}
                    </span>
                    <p className="text-xs text-slate-500">
                      Expires:{" "}
                      {new Date(invitation.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {isEditing && <SupervisorEditModal onSuccess={refreshSupervisors} />}
    </div>
  );
}
