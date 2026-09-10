import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  CalendarClock,
  Mail,
  MessageSquare,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";

import { AppLayout } from "@/components/AppLayout";
import { Alert, Button, EmptyState, InfoHint, PageHeader } from "@/components/ui-kit";
import {
  formatTimestamp,
  timeAgo,
  useActivity,
  useTicker,
  type ActivityKind,
} from "@/lib/storage";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/activity")({
  head: () => ({
    meta: [
      { title: "Activity | AI Workplace Productivity Assistant" },
      {
        name: "description",
        content:
          "Review a timestamped trail of the emails, summaries, schedules, research and THANDI conversations you created.",
      },
      { property: "og:title", content: "Activity trail" },
      {
        property: "og:description",
        content: "Every meaningful action recorded with the exact date and time.",
      },
    ],
  }),
  component: ActivityPage,
});

const ICONS: Record<ActivityKind, typeof Mail> = {
  email: Mail,
  meeting: MessageSquare,
  planner: CalendarClock,
  research: Search,
  chat: Sparkles,
};

const FILTERS: Array<{ id: "all" | ActivityKind; label: string }> = [
  { id: "all", label: "All" },
  { id: "email", label: "Emails" },
  { id: "meeting", label: "Meetings" },
  { id: "planner", label: "Tasks" },
  { id: "research", label: "Research" },
  { id: "chat", label: "THANDI" },
];

function ActivityPage() {
  const { items, clear } = useActivity();
  const [filter, setFilter] = useState<"all" | ActivityKind>("all");
  const [confirming, setConfirming] = useState(false);
  const [cleared, setCleared] = useState(false);

  // Keeps "2 minutes ago" accurate without touching the original timestamps.
  useTicker(30000);

  const visible = useMemo(
    () => (filter === "all" ? items : items.filter((i) => i.kind === filter)),
    [items, filter],
  );

  return (
    <AppLayout breadcrumb="Activity">
      <PageHeader
        title="Activity"
        subtitle="A lightweight audit trail of what you created in this workspace, newest first."
        help="Each action is recorded automatically with the exact date and time it occurred. Original timestamps never change."
      />

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filter activity by type"
        >
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              aria-pressed={filter === f.id}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm transition-colors",
                filter === f.id
                  ? "border-primary/40 bg-accent font-semibold text-accent-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {items.length > 0 ? (
          <Button
            variant="danger"
            size="sm"
            className="ml-auto"
            onClick={() => {
              setConfirming(true);
              setCleared(false);
            }}
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Clear history
          </Button>
        ) : null}
      </div>

      {confirming ? (
        <div className="mt-4 rounded-xl border border-destructive/40 bg-card p-4">
          <p className="text-sm font-semibold text-foreground">
            Clear your whole activity history?
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            This removes every recorded action and cannot be undone. Your saved drafts,
            tasks and conversations are not affected.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                clear();
                setConfirming(false);
                setCleared(true);
              }}
            >
              Yes, clear history
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      {cleared ? (
        <div className="mt-4">
          <Alert tone="success" title="Activity history cleared." />
        </div>
      ) : null}

      <div className="mt-4">
        {visible.length === 0 ? (
          <EmptyState title="No activity yet">
            {filter === "all"
              ? "Generate an email, summarize a meeting, plan tasks, run research or chat with THANDI — each action will be listed here with its timestamp."
              : "Nothing recorded for this filter yet. Try another category or use the matching tool."}
          </EmptyState>
        ) : (
          <ul className="flex flex-col gap-3">
            {visible.map((item) => {
              const Icon = ICONS[item.kind];
              return (
                <li
                  key={item.id}
                  className="glass-panel flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-start"
                >
                  <span
                    className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground"
                    aria-hidden="true"
                  >
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    {item.detail ? (
                      <p className="mt-0.5 text-sm leading-relaxed break-words text-muted-foreground">
                        {item.detail}
                      </p>
                    ) : null}
                    {item.actor ? (
                      <p className="mt-1 text-xs text-subtle-foreground">By {item.actor}</p>
                    ) : null}
                  </div>
                  <div className="shrink-0 text-left sm:text-right">
                    <p className="flex items-center gap-1.5 text-xs font-medium break-words text-foreground sm:justify-end">
                      <time dateTime={item.ts}>{formatTimestamp(item.at)}</time>
                      <InfoHint
                        label="Activity timestamp"
                        text="Each activity is automatically recorded with the date and time it occurred to support activity tracking and auditing."
                      />
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{timeAgo(item.at)}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AppLayout>
  );
}
