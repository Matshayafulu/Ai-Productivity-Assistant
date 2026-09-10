import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import { AVAILABILITY, useAvailability } from "@/lib/availability";
import { cn } from "@/lib/utils";

export function AvailabilityMenu({ compact = false }: { compact?: boolean }) {
  const { status, setStatus, option } = useAvailability();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Availability: ${option.label}. Change your availability`}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-secondary",
          compact && "w-full justify-between",
        )}
      >
        <span className="inline-flex items-center gap-1.5">
          <span className={cn("size-2 rounded-full", option.dotClass)} aria-hidden="true" />
          {option.label}
        </span>
        <ChevronDown className="size-3" aria-hidden="true" />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Set your availability"
          className="glass-panel absolute right-0 z-50 mt-2 w-56 rounded-xl p-1.5"
        >
          {AVAILABILITY.map((item) => (
            <button
              key={item.id}
              role="menuitemradio"
              aria-checked={item.id === status}
              onClick={() => {
                setStatus(item.id);
                setOpen(false);
              }}
              className="flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-secondary"
            >
              <span
                className={cn("mt-1.5 size-2 shrink-0 rounded-full", item.dotClass)}
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  {item.label}
                  {item.id === status ? (
                    <Check className="size-3.5 text-primary" aria-hidden="true" />
                  ) : null}
                </span>
                <span className="block text-xs leading-snug text-muted-foreground">
                  {item.description}
                </span>
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
