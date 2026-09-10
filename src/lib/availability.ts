import { usePersistentState } from "@/lib/storage";

export type AvailabilityId = "available" | "away" | "busy";

export type AvailabilityOption = {
  id: AvailabilityId;
  label: string;
  /** Text-only marker so status is never communicated by colour alone. */
  mark: string;
  dotClass: string;
  description: string;
};

export const AVAILABILITY: AvailabilityOption[] = [
  {
    id: "available",
    label: "Available",
    mark: "🟢",
    dotClass: "bg-success",
    description: "You are available.",
  },
  {
    id: "away",
    label: "Away",
    mark: "🟡",
    dotClass: "bg-warning",
    description: "You are temporarily away.",
  },
  {
    id: "busy",
    label: "Busy",
    mark: "🔴",
    dotClass: "bg-destructive",
    description: "You are unavailable or focusing on another task.",
  },
];

export function availabilityOf(id: AvailabilityId): AvailabilityOption {
  return AVAILABILITY.find((a) => a.id === id) ?? AVAILABILITY[0]!;
}

/** Current availability, persisted so it survives refreshes. */
export function useAvailability() {
  const [status, setStatus] = usePersistentState<AvailabilityId>(
    "availability",
    "available",
  );
  return { status, setStatus, option: availabilityOf(status) };
}
