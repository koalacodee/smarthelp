"use client";

import { useState, useEffect } from "react";
import SupervisorEditModal from "./SupervisorEditModal";
import SupervisorsTable from "./SupervisorsTable";
import { useSupervisorsStore } from "../store/useSupervisorsStore";
import { useCurrentEditingSupervisorStore } from "../store/useCurrentEditingSupervisorStore";
import { SupervisorsService } from "@/lib/api/index";

interface SupervisorsPageClientProps {
  initialSupervisors: any[];
}

export default function SupervisorsPageClient({
  initialSupervisors,
}: SupervisorsPageClientProps) {
  const { supervisors, setSupervisors } = useSupervisorsStore();
  const { setSupervisor, setIsEditing, isEditing } =
    useCurrentEditingSupervisorStore();
  const [searchTerm, setSearchTerm] = useState("");

  // Initialize with server data
  useEffect(() => {
    setSupervisors(initialSupervisors);
  }, [initialSupervisors, setSupervisors]);

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
          Add Supervisor
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
      {isEditing && <SupervisorEditModal onSuccess={refreshSupervisors} />}
    </div>
  );
}
