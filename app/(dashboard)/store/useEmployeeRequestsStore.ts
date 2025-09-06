import { create } from 'zustand';
import { Datum } from '@/lib/api/employee-requests';

interface EmployeeRequestsStore {
  requests: Datum[];
  isLoading: boolean;
  error: string | null;
  setRequests: (requests: Datum[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addRequest: (request: Datum) => void;
  updateRequest: (id: string, request: Datum) => void;
  removeRequest: (id: string) => void;
}

export const useEmployeeRequestsStore = create<EmployeeRequestsStore>((set) => ({
  requests: [],
  isLoading: false,
  error: null,
  setRequests: (requests) => set({ requests }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  addRequest: (request) => set((state) => ({ 
    requests: [request, ...state.requests] 
  })),
  updateRequest: (id, updatedRequest) => set((state) => ({
    requests: state.requests.map((request) =>
      request.id === id ? updatedRequest : request
    ),
  })),
  removeRequest: (id) => set((state) => ({
    requests: state.requests.filter((request) => request.id !== id),
  })),
}));
