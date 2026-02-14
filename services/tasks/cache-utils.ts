import type { QueryClient } from "@tanstack/react-query";
import { taskKeys } from "./keys";
import type { TaskResponse } from "./types";

// ═══════════════════════════════════════════════════════════════════════
// INTERNAL HELPERS
// ═══════════════════════════════════════════════════════════════════════

type AnyRecord = Record<string, unknown>;

/**
 * Merge helper that preserves existing values when the updated task
 * explicitly provides `undefined` for a field. This allows us to do
 * incremental updates where the backend omits or nulls out some
 * presentation-only fields (like `assigneeName`) without wiping the
 * previous cached value.
 */
function mergeTask(prev: TaskResponse, next: TaskResponse): TaskResponse {
  // Start from the previous task so we can selectively override.
  const merged: TaskResponse = { ...prev };

  (Object.keys(next) as (keyof TaskResponse)[]).forEach((key) => {
    const value = next[key];

    // Only override when the new value is not `undefined`.
    // `null` is allowed and will intentionally clear the field.
    if (value !== undefined) {
      (merged as unknown as AnyRecord)[key as string] = value as unknown;
    }
  });

  return merged;
}

/**
 * Patches a single task inside a cached query result, handling all known
 * response shapes produced by the task API.
 *
 * Shapes handled:
 *  1. `{ task: TaskResponse, ... }`
 *     → detail, markTaskSeen
 *  2. `{ data: Array<{ task: TaskResponse, ... }>, ... }`
 *     → myTasks
 *  3. `{ data: { tasks: TaskResponse[], ... }, ... }`
 *     → teamTasks, departmentLevel, subDepartment, individual, withFilters, allTasks
 *  4. `{ data: { tasks: Array<{ task: TaskResponse, ... }>, ... }, ... }`
 *     → teamTasksForSupervisor
 */
function patchTask(
  cached: AnyRecord,
  taskId: string,
  updated: TaskResponse,
): AnyRecord {
  // Shape 1: { task }
  if (isTaskResponse(cached.task) && (cached.task as TaskResponse).id === taskId) {
    const existing = cached.task as TaskResponse;
    return { ...cached, task: mergeTask(existing, updated) };
  }

  const data = cached.data;

  // Shape 2: { data: [{ task }, ...] }
  if (Array.isArray(data) && data.length > 0 && isTaskResponse(data[0]?.task)) {
    return {
      ...cached,
      data: data.map((item: AnyRecord) =>
        (item.task as TaskResponse).id === taskId
          ? {
            ...item,
            task: mergeTask(item.task as TaskResponse, updated),
          }
          : item,
      ),
    };
  }

  // Shape 3 & 4: { data: { tasks: [...] } }
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const inner = data as AnyRecord;
    const tasks = inner.tasks;

    if (Array.isArray(tasks) && tasks.length > 0) {
      // Shape 4: tasks are wrapped — [{ task: TaskResponse, ... }]
      if (isTaskResponse(tasks[0]?.task)) {
        return {
          ...cached,
          data: {
            ...inner,
            tasks: tasks.map((item: AnyRecord) =>
              (item.task as TaskResponse).id === taskId
                ? {
                  ...item,
                  task: mergeTask(item.task as TaskResponse, updated),
                }
                : item,
            ),
          },
        };
      }

      // Shape 3: tasks are plain — TaskResponse[]
      if (isTaskResponse(tasks[0])) {
        return {
          ...cached,
          data: {
            ...inner,
            tasks: tasks.map((t: TaskResponse) =>
              t.id === taskId ? mergeTask(t, updated) : t,
            ),
          },
        };
      }
    }
  }

  return cached;
}

/**
 * Removes a task from a cached query result, handling all known shapes.
 */
function removeTask(cached: AnyRecord, taskId: string): AnyRecord | undefined {
  // Shape 1: detail — remove entire cache entry
  if (isTaskResponse(cached.task) && (cached.task as TaskResponse).id === taskId) {
    return undefined;
  }

  const data = cached.data;

  // Shape 2: { data: [{ task }, ...] }
  if (Array.isArray(data) && data.length > 0 && isTaskResponse(data[0]?.task)) {
    return {
      ...cached,
      data: data.filter(
        (item: AnyRecord) => (item.task as TaskResponse).id !== taskId,
      ),
    };
  }

  // Shape 3 & 4: { data: { tasks: [...] } }
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const inner = data as AnyRecord;
    const tasks = inner.tasks;

    if (Array.isArray(tasks) && tasks.length > 0) {
      // Shape 4: wrapped
      if (isTaskResponse(tasks[0]?.task)) {
        return {
          ...cached,
          data: {
            ...inner,
            tasks: tasks.filter(
              (item: AnyRecord) => (item.task as TaskResponse).id !== taskId,
            ),
          },
        };
      }

      // Shape 3: plain
      if (isTaskResponse(tasks[0])) {
        return {
          ...cached,
          data: {
            ...inner,
            tasks: tasks.filter((t: TaskResponse) => t.id !== taskId),
          },
        };
      }
    }
  }

  return cached;
}

function isTaskResponse(value: unknown): value is TaskResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "title" in value &&
    "status" in value
  );
}

/**
 * Adds new tasks to list-shaped cached query results.
 * Prepends tasks at the beginning; skips if task ID already exists.
 *
 * Shapes handled:
 *  2. `{ data: Array<{ task: TaskResponse, ... }>, ... }` → myTasks
 *  3. `{ data: { tasks: TaskResponse[], ... }, ... }` → teamTasks, etc.
 *  4. `{ data: { tasks: Array<{ task: TaskResponse, ... }>, ... }, ... }` → teamTasksForSupervisor
 */
function addTasks(cached: AnyRecord, newTasks: TaskResponse[]): AnyRecord {
  if (newTasks.length === 0) return cached;

  const data = cached.data;

  // Shape 2: { data: [{ task }, ...] } (including empty array)
  if (
    Array.isArray(data) &&
    (data.length === 0 || isTaskResponse((data[0] as AnyRecord)?.task))
  ) {
    const existingIds = new Set(
      data.map((item: AnyRecord) => (item.task as TaskResponse)?.id).filter(Boolean),
    );
    const toPrepend = newTasks
      .filter((t) => !existingIds.has(t.id))
      .map((task) => ({ task }));
    if (toPrepend.length === 0) return cached;
    return { ...cached, data: [...toPrepend, ...data] };
  }

  // Shape 3 & 4: { data: { tasks: [...] } }
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const inner = data as AnyRecord;
    const tasks = inner.tasks;

    if (!Array.isArray(tasks)) return cached;

    // Shape 4: wrapped
    if (tasks.length === 0 || isTaskResponse(tasks[0]?.task)) {
      const existingIds = new Set(
        tasks.map((item: AnyRecord) => (item.task as TaskResponse)?.id).filter(Boolean),
      );
      const toPrepend = newTasks
        .filter((t) => !existingIds.has(t.id))
        .map((task) => ({ task }));
      if (toPrepend.length === 0) return cached;
      return {
        ...cached,
        data: { ...inner, tasks: [...toPrepend, ...tasks] },
      };
    }

    // Shape 3: plain
    if (isTaskResponse(tasks[0])) {
      const existingIds = new Set(
        (tasks as TaskResponse[]).map((t) => t.id).filter(Boolean),
      );
      const toPrepend = newTasks.filter((t) => !existingIds.has(t.id));
      if (toPrepend.length === 0) return cached;
      return {
        ...cached,
        data: { ...inner, tasks: [...toPrepend, ...tasks] },
      };
    }
  }

  return cached;
}

// ═══════════════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════════════

/**
 * Adds new tasks to list-shaped caches under `taskKeys.all`.
 * Use after create operations to show new tasks without refetching.
 */
export function addTasksToCache(
  qc: QueryClient,
  tasks: TaskResponse | TaskResponse[],
) {
  const taskArray = Array.isArray(tasks) ? tasks : [tasks];
  if (taskArray.length === 0) return;

  qc.setQueriesData<unknown>({ queryKey: taskKeys.all }, (old: unknown) => {
    if (!old || typeof old !== "object") return old;
    return addTasks(old as AnyRecord, taskArray);
  });
}

/**
 * Updates a task in every cached query result under `taskKeys.all`.
 * Works across all response shapes (detail, myTasks, teamTasks, etc.).
 */
export function updateTaskInCache(
  qc: QueryClient,
  updatedTask: TaskResponse,
) {
  qc.setQueriesData<unknown>({ queryKey: taskKeys.all }, (old: unknown) => {
    if (!old || typeof old !== "object") return old;
    return patchTask(old as AnyRecord, updatedTask.id, updatedTask);
  });
}

/**
 * Removes a task from every cached query result under `taskKeys.all`.
 * Also removes the detail cache entry entirely.
 */
export function removeTaskFromCache(qc: QueryClient, taskId: string) {
  qc.removeQueries({ queryKey: taskKeys.detail(taskId) });
  qc.setQueriesData<unknown>({ queryKey: taskKeys.all }, (old: unknown) => {
    if (!old || typeof old !== "object") return old;
    return removeTask(old as AnyRecord, taskId);
  });
}

/**
 * Adjusts the cached task count by a delta (+1 / -1).
 */
export function updateCountCache(qc: QueryClient, delta: number) {
  qc.setQueryData<{ count: number } | undefined>(
    taskKeys.count(),
    (old) => {
      if (!old) return old;
      return { ...old, count: Math.max(0, old.count + delta) };
    },
  );
}
