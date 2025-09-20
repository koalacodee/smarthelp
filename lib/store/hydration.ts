import { useEffect } from "react";

// Hook to hydrate stores with server-side data
export function useHydrateStore<T>(
  store: any,
  serverData: T | null,
  dataKey: string
) {
  useEffect(() => {
    if (serverData && store.getState()[dataKey].length === 0) {
      store.getState().setEntities(serverData);
    }
  }, [serverData, store, dataKey]);
}

// Hook to hydrate multiple stores at once
export function useHydrateStores(
  hydrations: Array<{
    store: any;
    serverData: any;
    dataKey: string;
  }>
) {
  useEffect(() => {
    hydrations.forEach(({ store, serverData, dataKey }) => {
      if (serverData && store.getState()[dataKey].length === 0) {
        store.getState().setEntities(serverData);
      }
    });
  }, [hydrations]);
}

// Utility to create a hydrated store hook
export function createHydratedStore<T>(
  store: any,
  dataKey: string = "entities"
) {
  return function useHydratedStore(serverData: T | null) {
    useHydrateStore(store, serverData, dataKey);
    return store();
  };
}
