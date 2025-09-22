import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface BaseEntity {
  id: string;
  updatedAt?: string;
}

interface EntityStoreState<T extends BaseEntity> {
  // Data
  entities: T[];

  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;

  // Error handling
  error: string | null;

  // Actions
  setEntities: (entities: T[]) => void;
  addEntity: (entity: T) => void;
  addEntities: (entities: T[]) => void;
  updateEntity: (id: string, updates: Partial<T>) => void;
  deleteEntity: (id: string) => void;
  clearEntities: () => void;

  // Loading actions
  setLoading: (loading: boolean) => void;
  setCreating: (creating: boolean) => void;
  setUpdating: (updating: boolean) => void;
  setDeleting: (deleting: boolean) => void;
  setError: (error: string | null) => void;

  // Utility actions
  getEntityById: (id: string) => T | undefined;
  getEntitiesByField: <K extends keyof T>(field: K, value: T[K]) => T[];
}

export function createEntityStore<T extends BaseEntity>(
  storeName: string,
  options?: {
    persist?: boolean;
    partialize?: (state: EntityStoreState<T>) => Partial<EntityStoreState<T>>;
  }
) {
  const storeFactory = (set: any, get: any): EntityStoreState<T> => ({
    // Initial state
    entities: [],
    isLoading: false,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    error: null,

    // Data actions
    setEntities: (entities) => set({ entities }),

    addEntity: (entity) =>
      set((state: EntityStoreState<T>) => ({
        entities: [...state.entities, entity],
      })),

    addEntities: (entities) =>
      set((state: EntityStoreState<T>) => ({
        entities: [...state.entities, ...entities],
      })),

    updateEntity: (id, updates) =>
      set((state: EntityStoreState<T>) => ({
        entities: state.entities.map((entity) =>
          entity.id === id
            ? { ...entity, ...updates, updatedAt: new Date().toISOString() }
            : entity
        ),
      })),

    deleteEntity: (id) =>
      set((state: EntityStoreState<T>) => ({
        entities: state.entities.filter((entity) => entity.id !== id),
      })),

    clearEntities: () => set({ entities: [] }),

    // Loading actions
    setLoading: (isLoading) => set({ isLoading }),
    setCreating: (isCreating) => set({ isCreating }),
    setUpdating: (isUpdating) => set({ isUpdating }),
    setDeleting: (isDeleting) => set({ isDeleting }),
    setError: (error) => set({ error }),

    // Utility actions
    getEntityById: (id: string) => {
      const state = get();
      return state.entities.find((entity: T) => entity.id === id);
    },

    getEntitiesByField: <K extends keyof T>(field: K, value: T[K]) => {
      const state = get();
      return state.entities.filter((entity: T) => entity[field] === value);
    },
  });

  if (options?.persist) {
    return create<EntityStoreState<T>>()(
      persist(storeFactory, {
        name: storeName,
        storage: createJSONStorage(() => localStorage),
        partialize:
          options.partialize ||
          ((state) => ({
            entities: state.entities,
          })),
      })
    );
  }

  return create<EntityStoreState<T>>(storeFactory);
}
