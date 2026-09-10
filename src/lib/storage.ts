import { useCallback, useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

const PREFIX = "awpa:";

/* ------------------------------------------------------------------ *
 * Local (browser) layer — used before sign-in and as the migration
 * source the first time a person signs in.
 * ------------------------------------------------------------------ */

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

function localKeys() {
  if (typeof window === "undefined") return [] as string[];
  return Object.keys(window.localStorage)
    .filter((k) => k.startsWith(PREFIX))
    .map((k) => k.slice(PREFIX.length));
}

/* ------------------------------------------------------------------ *
 * Account-backed store. Values live in the `user_data` table, one row
 * per key, readable only by their owner.
 * ------------------------------------------------------------------ */

const cache = new Map<string, unknown>();
const listeners = new Set<() => void>();
const pending = new Map<string, ReturnType<typeof setTimeout>>();

let currentUserId: string | null = null;
let ready = false;

function notify() {
  listeners.forEach((fn) => fn());
}

export function subscribeStore(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function storeReady() {
  return ready;
}

async function push(key: string, value: unknown) {
  if (!currentUserId) return;
  await supabase
    .from("user_data")
    .upsert({ user_id: currentUserId, key, value: value as never }, { onConflict: "user_id,key" });
}

function schedulePush(key: string, value: unknown) {
  const existing = pending.get(key);
  if (existing) clearTimeout(existing);
  pending.set(
    key,
    setTimeout(() => {
      pending.delete(key);
      void push(key, value);
    }, 400),
  );
}

/** Loads the signed-in person's saved work and moves any browser-only work into their account. */
export async function initUserStore(userId: string) {
  currentUserId = userId;
  ready = false;
  cache.clear();
  notify();

  const { data } = await supabase.from("user_data").select("key, value").eq("user_id", userId);
  (data ?? []).forEach((row) => cache.set(row.key, row.value));

  // First sign-in migration: anything saved in this browser that the account
  // doesn't have yet becomes theirs.
  const toMigrate = localKeys().filter((key) => !cache.has(key));
  if (toMigrate.length > 0) {
    const rows = toMigrate.map((key) => ({
      user_id: userId,
      key,
      value: loadJson<unknown>(key, null) as never,
    }));
    rows.forEach((row) => cache.set(row.key, row.value));
    await supabase.from("user_data").upsert(rows, { onConflict: "user_id,key" });
    toMigrate.forEach((key) => window.localStorage.removeItem(PREFIX + key));
  }

  ready = true;
  notify();
}

export function resetUserStore() {
  currentUserId = null;
  cache.clear();
  ready = false;
  notify();
}

/** Removes every saved value for the signed-in person. */
export async function clearAllData() {
  cache.clear();
  notify();
  if (typeof window !== "undefined") {
    localKeys().forEach((key) => window.localStorage.removeItem(PREFIX + key));
  }
  if (currentUserId) {
    await supabase.from("user_data").delete().eq("user_id", currentUserId);
  }
}

function readValue<T>(key: string, fallback: T): T {
  if (currentUserId) {
    const cached = cache.get(key);
    return cached === undefined || cached === null ? fallback : (cached as T);
  }
  return loadJson<T>(key, fallback);
}

function writeValue(key: string, value: unknown) {
  if (currentUserId) {
    cache.set(key, value);
    schedulePush(key, value);
  } else {
    saveJson(key, value);
  }
  notify();
}

/** State that survives reloads and follows the signed-in person across devices. */
export function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const sync = () => {
      setValue(readValue<T>(key, initial));
      setHydrated(!currentUserId || storeReady());
    };
    sync();
    return subscribeStore(sync);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        writeValue(key, resolved);
        return resolved;
      });
    },
    [key],
  );

  return [value, update, hydrated] as const;
}

/* ------------------------------------------------------------------ *
 * Activity tracker / lightweight audit trail.
 * Every meaningful action is recorded the moment it happens, with the
 * real system time stored in ISO 8601 (with local offset).
 * ------------------------------------------------------------------ */

export type ActivityKind = "email" | "meeting" | "planner" | "research" | "chat";

export type ActivityItem = {
  /** Stable record id. */
  id: string;
  kind: ActivityKind;
  /** Short activity name, e.g. "Email generated". */
  title: string;
  /** Human description of what happened (non-sensitive, truncated). */
  detail: string;
  /** Original event time, epoch ms. Never changes. */
  at: number;
  /** Original event time, ISO 8601 with local offset. Never changes. */
  ts: string;
  /** Who performed it, where known (display name or email prefix). */
  actor?: string;
  /** Small non-sensitive extras, e.g. { tone: "Formal" }. */
  meta?: Record<string, string>;
};

const ACTIVITY_KEY = "activity";
const ACTIVITY_LIMIT = 200;

let actorLabel = "";

/** Records who is performing actions, for the audit trail. */
export function setActivityActor(label: string) {
  actorLabel = label;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** ISO 8601 timestamp including the local UTC offset, e.g. 2026-09-10T08:46:18+02:00. */
export function isoWithOffset(date: Date) {
  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? "+" : "-";
  const abs = Math.abs(offset);
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}` +
    `${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`
  );
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Readable event time, e.g. "10 Sep 2026 • 08:46:18". */
export function formatTimestamp(at: number) {
  const d = new Date(at);
  return (
    `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()} • ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  );
}

export function logActivity(
  kind: ActivityKind,
  title: string,
  detail: string,
  meta?: Record<string, string>,
) {
  const now = new Date();
  const items = readValue<ActivityItem[]>(ACTIVITY_KEY, []);
  const entry: ActivityItem = {
    id: `${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    kind,
    title,
    detail: detail.slice(0, 120),
    at: now.getTime(),
    ts: isoWithOffset(now),
    ...(actorLabel ? { actor: actorLabel } : {}),
    ...(meta ? { meta } : {}),
  };
  writeValue(ACTIVITY_KEY, [entry, ...items].slice(0, ACTIVITY_LIMIT));
}

/** Normalises older records that predate the ISO timestamp field. */
function normalise(items: ActivityItem[]): ActivityItem[] {
  return items.map((item) =>
    item.ts ? item : { ...item, ts: isoWithOffset(new Date(item.at)) },
  );
}

export function useActivity() {
  const [items, setItems] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const read = () => setItems(normalise(readValue<ActivityItem[]>(ACTIVITY_KEY, [])));
    read();
    return subscribeStore(read);
  }, []);

  const clear = useCallback(() => {
    writeValue(ACTIVITY_KEY, []);
    setItems([]);
  }, []);

  return { items, clear };
}

/** Re-renders on an interval so relative timestamps stay current. */
export function useTicker(everyMs = 30000) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), everyMs);
    return () => window.clearInterval(id);
  }, [everyMs]);
}

export function timeAgo(ts: number) {
  const diff = Math.max(0, Date.now() - ts);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins === 1) return "1 minute ago";
  if (mins < 60) return `${mins} minutes ago`;
  const hours = Math.floor(mins / 60);
  if (hours === 1) return "1 hour ago";
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "Yesterday" : `${days} days ago`;
}

