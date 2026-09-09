import { useCallback, useEffect, useState } from "react";

const PREFIX = "awpa:";

export function loadJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function saveJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* storage unavailable — the app keeps working in memory */
  }
}

/** State that survives reloads. Hydrates after mount to avoid SSR mismatches. */
export function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setValue(loadJson<T>(key, initial));
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved =
          typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        saveJson(key, resolved);
        return resolved;
      });
    },
    [key],
  );

  return [value, update, hydrated] as const;
}

export type ActivityKind = "email" | "meeting" | "planner" | "research" | "chat";

export type ActivityItem = {
  id: string;
  kind: ActivityKind;
  title: string;
  detail: string;
  at: number;
};

const ACTIVITY_KEY = "activity";
const ACTIVITY_EVENT = "awpa:activity";

export function logActivity(kind: ActivityKind, title: string, detail: string) {
  const items = loadJson<ActivityItem[]>(ACTIVITY_KEY, []);
  const next = [
    {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      kind,
      title,
      detail: detail.slice(0, 90),
      at: Date.now(),
    },
    ...items,
  ].slice(0, 12);
  saveJson(ACTIVITY_KEY, next);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(ACTIVITY_EVENT));
  }
}

export function useActivity() {
  const [items, setItems] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const read = () => setItems(loadJson<ActivityItem[]>(ACTIVITY_KEY, []));
    read();
    window.addEventListener(ACTIVITY_EVENT, read);
    return () => window.removeEventListener(ACTIVITY_EVENT, read);
  }, []);

  const clear = useCallback(() => {
    saveJson(ACTIVITY_KEY, []);
    setItems([]);
  }, []);

  return { items, clear };
}

export function timeAgo(ts: number) {
  const diff = Math.max(0, Date.now() - ts);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "Yesterday" : `${days}d ago`;
}
