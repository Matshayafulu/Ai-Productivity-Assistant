import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarClock,
  Mail,
  MessageSquare,
  Search,
  Sparkles,
} from "lucide-react";

import { AppLayout } from "@/components/AppLayout";
import { Button, Card } from "@/components/ui-kit";
import { timeAgo, useActivity, type ActivityKind } from "@/lib/storage";

export const Route = createFileRoute("/_authenticated/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard | AI Workplace Productivity Assistant" },
      {
        name: "description",
        content:
          "Five AI tools for everyday work: write emails, summarize meetings, plan tasks, research topics and chat with a workplace assistant.",
      },
      { property: "og:title", content: "AI Workplace Productivity Assistant" },
      {
        property: "og:description",
        content: "Work smarter. Write faster. Organize better.",
      },
    ],
  }),
  component: Dashboard,
});

const FEATURES = [
  {
    to: "/email-generator",
    icon: Mail,
    title: "Smart Email Generator",
    description: "Generate professional workplace emails quickly.",
    action: "Create Email",
  },
  {
    to: "/meeting-summarizer",
    icon: MessageSquare,
    title: "Meeting Notes Summarizer",
    description: "Turn lengthy meeting notes into useful summaries and action items.",
    action: "Summarize Notes",
  },
  {
    to: "/task-planner",
    icon: CalendarClock,
    title: "AI Task Planner",
    description:
      "Create intelligent daily and weekly schedules based on priorities and deadlines.",
    action: "Plan My Tasks",
  },
  {
    to: "/research-assistant",
    icon: Search,
    title: "AI Research Assistant",
    description: "Research topics, summarize information and generate useful insights.",
    action: "Start Research",
  },
  {
    to: "/ai-chat",
    icon: Sparkles,
    title: "AI Workplace Assistant",
    description: "Chat with an AI assistant for workplace productivity and problem-solving.",
    action: "Open Assistant",
  },
] as const;

const ACTIVITY_ICON: Record<ActivityKind, typeof Mail> = {
  email: Mail,
  meeting: MessageSquare,
  planner: CalendarClock,
  research: Search,
  chat: Sparkles,
};

function Dashboard() {
  const { items, clear } = useActivity();

  return (
    <AppLayout breadcrumb="Dashboard">
      <section className="anim-in">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
          <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
          Your productivity workspace
        </span>
        <h1 className="mt-4 max-w-[20ch] text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
          AI Workplace Productivity Assistant
        </h1>
        <p className="mt-3 max-w-[52ch] text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg">
          Work smarter. Write faster. Organize better.
        </p>
        <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-pretty text-muted-foreground">
          Five focused AI tools in one calm workspace. Pick a tool, enter your
          information, generate a result, then review, edit and copy it. You stay in
          control of every output.
        </p>
      </section>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {FEATURES.map(({ to, icon: Icon, title, description, action }) => (
          <article
            key={to}
            className="glass-panel anim-in flex flex-col rounded-2xl p-5 transition-shadow hover:shadow-lg hover:shadow-primary/5"
          >
            <div
              className="grid size-10 place-items-center rounded-xl bg-accent text-accent-foreground"
              aria-hidden="true"
            >
              <Icon className="size-5" />
            </div>
            <h2 className="mt-4 text-base font-semibold text-balance text-foreground">
              {title}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-pretty text-muted-foreground">
              {description}
            </p>
            <Link to={to} className="mt-4 inline-flex w-fit">
              <Button size="sm">
                {action}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            </Link>
          </article>
        ))}

        <Card className="anim-in flex flex-col">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-foreground">Recent Activity</h2>
            {items.length > 0 ? (
              <button
                onClick={clear}
                className="rounded-md px-1.5 py-1 text-xs font-medium text-primary hover:underline"
              >
                Clear
              </button>
            ) : null}
          </div>

          {items.length === 0 ? (
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Nothing yet. Once you generate an email, summary, schedule or research
              result, it will be listed here.
            </p>
          ) : (
            <ul className="mt-4 flex flex-col divide-y divide-border">
              {items.slice(0, 5).map((item) => {
                const Icon = ACTIVITY_ICON[item.kind];
                return (
                  <li key={item.id} className="flex items-start gap-3 py-3">
                    <span
                      className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-md bg-accent text-accent-foreground"
                      aria-hidden="true"
                    >
                      <Icon className="size-3" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {item.detail} · {timeAgo(item.at)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}
