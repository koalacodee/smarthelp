import { create } from "zustand";
import { Department } from "@/lib/api/departments";

export interface DepartmentsState {
    // #region Sub Departments
    subDepartments: Department[];
    setSubDepartments: (departments: Department[]) => void;
    addSubDepartment: (department: Department) => void;
    updateSubDepartment: (updatedDepartment: Department) => void;
    upsertSubDepartment: (department: Department) => void;
    removeSubDepartment: (departmentId: string) => void;
    getSubDepartmentById: (departmentId: string) => Department | undefined;
    clearSubDepartments: () => void;
    // #endregion

    // #region Departments
    departments: Department[];
    setDepartments: (departments: Department[]) => void;
    addDepartment: (department: Department) => void;
    updateDepartment: (updatedDepartment: Department) => void;
    upsertDepartment: (department: Department) => void;
    removeDepartment: (departmentId: string) => void;
    getDepartmentById: (departmentId: string) => Department | undefined;
    clearDepartments: () => void;
    // #endregion

    departmentsMap: Record<string, Department[]>;
    setDepartmentsMap: (map: Record<string, Department[]>) => void;
    setDepartmentsForParent: (parentId: string, departments: Department[]) => void;
    addDepartmentToParent: (parentId: string, department: Department) => void;
    updateDepartmentInParent: (parentId: string, department: Department) => void;
    removeDepartmentFromParent: (parentId: string, departmentId: string) => void;
    clearDepartmentsMap: () => void;
    clearDepartmentsForParent: (parentId: string) => void;
}

export const useDepartmentsStore = create<DepartmentsState>((set, get) => ({
    // #region Sub Departments
    subDepartments: [],

    setSubDepartments: (departments) =>
        set({ subDepartments: departments }),

    addSubDepartment: (department) =>
        set((state) => ({
            subDepartments: [...state.subDepartments, department]
        })),

    updateSubDepartment: (updatedDepartment) =>
        set((state) => ({
            subDepartments: state.subDepartments.map((dept) =>
                dept.id === updatedDepartment.id ? updatedDepartment : dept
            ),
        })),

    upsertSubDepartment: (department) => {
        const { subDepartments } = get();
        const exists = subDepartments.some((dept) => dept.id === department.id);

        if (exists) {
            get().updateSubDepartment(department);
        } else {
            get().addSubDepartment(department);
        }
    },

    removeSubDepartment: (departmentId) =>
        set((state) => ({
            subDepartments: state.subDepartments.filter((dept) => dept.id !== departmentId),
        })),

    getSubDepartmentById: (departmentId) => {
        const { subDepartments } = get();
        return subDepartments.find((dept) => dept.id === departmentId);
    },

    clearSubDepartments: () =>
        set({ subDepartments: [] }),
    // #endregion

    // #region Departments
    departments: [],

    setDepartments: (departments) =>
        set({ departments }),

    addDepartment: (department) =>
        set((state) => ({
            departments: [...state.departments, department]
        })),

    updateDepartment: (updatedDepartment) =>
        set((state) => ({
            departments: state.departments.map((dept) =>
                dept.id === updatedDepartment.id ? updatedDepartment : dept
            ),
        })),

    upsertDepartment: (department) => {
        const { departments } = get();
        const exists = departments.some((dept) => dept.id === department.id);

        if (exists) {
            get().updateDepartment(department);
        } else {
            get().addDepartment(department);
        }
    },

    removeDepartment: (departmentId) =>
        set((state) => ({
            departments: state.departments.filter((dept) => dept.id !== departmentId),
        })),

    getDepartmentById: (departmentId) => {
        const { departments } = get();
        return departments.find((dept) => dept.id === departmentId);
    },

    clearDepartments: () =>
        set({ departments: [] }),
    // #endregion

    // #region Departments Map
    departmentsMap: {},

    setDepartmentsMap: (map) =>
        set({ departmentsMap: map }),

    setDepartmentsForParent: (parentId, departments) =>
        set((state) => ({
            departmentsMap: {
                ...state.departmentsMap,
                [parentId]: departments,
            },
        })),

    addDepartmentToParent: (parentId, department) =>
        set((state) => ({
            departmentsMap: {
                ...state.departmentsMap,
                [parentId]: [...(state.departmentsMap[parentId] || []), department],
            },
        })),

    updateDepartmentInParent: (parentId, department) =>
        set((state) => ({
            departmentsMap: {
                ...state.departmentsMap,
                [parentId]: (state.departmentsMap[parentId] || []).map((dept) =>
                    dept.id === department.id ? department : dept
                ),
            },
        })),

    removeDepartmentFromParent: (parentId, departmentId) =>
        set((state) => ({
            departmentsMap: {
                ...state.departmentsMap,
                [parentId]: (state.departmentsMap[parentId] || []).filter(
                    (dept) => dept.id !== departmentId
                ),
            },
        })),

    clearDepartmentsForParent: (parentId) =>
        set((state) => ({
            departmentsMap: {
                ...state.departmentsMap,
                [parentId]: [],
            },
        })),

    clearDepartmentsMap: () =>
        set({ departmentsMap: {} }),
    // #endregion
}));
