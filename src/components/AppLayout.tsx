import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import {
  CalendarClock,
  LayoutGrid,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  Search,
  Settings,
  ShieldAlert,
  Sparkles,
  X,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { initialsOf, useAccount } from "@/lib/useAccount";
import { resetUserStore } from "@/lib/storage";
import { cn } from "@/lib/utils";

export const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/email-generator", label: "Email Generator", icon: Mail },
  { to: "/meeting-summarizer", label: "Meeting Summarizer", icon: MessageSquare },
  { to: "/task-planner", label: "Task Planner", icon: CalendarClock },
  { to: "/research-assistant", label: "Research Assistant", icon: Search },
  { to: "/ai-chat", label: "AI Assistant", icon: Sparkles },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-2 py-2">
      <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
        A
      </div>
      <div className="leading-tight">
        <div className="text-sm font-semibold text-foreground">AI Workplace</div>
        <div className="text-[11px] text-subtle-foreground">Productivity Assistant</div>
      </div>
    </div>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="flex flex-col gap-0.5" aria-label="Main">
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
        const active = pathname === to;
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
              active
                ? "bg-accent font-semibold text-accent-foreground ring-1 ring-primary/25"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function AiStatusCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center gap-2 text-xs font-medium text-foreground">
        <span className="size-2 rounded-full bg-success" aria-hidden="true" />
        AI service · Connected
      </div>
      <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">
        Results are AI-generated. Review before use.
      </p>
    </div>
  );
}

export function ResponsibleAiNotice({ className }: { className?: string }) {
  return (
    <section
      className={cn(
        "glass-panel flex flex-col gap-3 rounded-2xl p-5 sm:flex-row sm:items-start",
        className,
      )}
      aria-labelledby="responsible-ai-heading"
    >
      <span
        className="grid size-9 shrink-0 place-items-center rounded-lg border border-warning/40 text-warning"
        aria-hidden="true"
      >
        <ShieldAlert className="size-4" />
      </span>
      <div>
        <h2 id="responsible-ai-heading" className="text-sm font-semibold text-foreground">
          Responsible AI Notice
        </h2>
        <p className="mt-1 max-w-[70ch] text-sm leading-relaxed text-muted-foreground">
          AI-generated content may contain errors or inaccuracies. Review important
          information before using it in professional, legal, financial, medical or other
          high-impact situations. Avoid entering confidential or sensitive information
          unless appropriate.
        </p>
      </div>
    </section>
  );
}

export function AppLayout({
  breadcrumb,
  children,
}: {
  breadcrumb: string;
  children: ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 -left-24 size-[520px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-1/3 -right-32 size-[460px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <aside className="glass-panel sticky top-0 hidden h-screen w-64 shrink-0 flex-col rounded-none border-y-0 border-l-0 p-4 lg:flex">
          <Brand />
          <div className="mt-6">
            <NavLinks />
          </div>
          <div className="mt-auto">
            <AiStatusCard />
          </div>
        </aside>

        {/* Mobile drawer */}
        {menuOpen ? (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              className="absolute inset-0 bg-foreground/40"
              aria-label="Close navigation menu"
              onClick={() => setMenuOpen(false)}
            />
            <div
              id="mobile-nav"
              className="glass-panel absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col rounded-none p-4"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation"
            >
              <div className="flex items-center justify-between">
                <Brand />
                <button
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close navigation menu"
                  className="grid size-9 place-items-center rounded-lg border border-border bg-card text-foreground"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-4 overflow-y-auto">
                <NavLinks onNavigate={() => setMenuOpen(false)} />
              </div>
              <div className="mt-auto pt-4">
                <AiStatusCard />
              </div>
            </div>
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="glass-panel sticky top-0 z-30 flex items-center gap-3 rounded-none border-x-0 border-t-0 px-4 py-3 sm:px-6">
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              className="grid size-9 place-items-center rounded-lg border border-border bg-card text-foreground lg:hidden"
            >
              <Menu className="size-4" aria-hidden="true" />
            </button>
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
              <span className="hidden text-subtle-foreground sm:inline">Workspace</span>
              <span className="hidden text-subtle-foreground sm:inline" aria-hidden="true">
                /
              </span>
              <span className="font-medium text-foreground">{breadcrumb}</span>
            </nav>
            <div className="ml-auto flex items-center gap-2.5">
              <span className="hidden rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground sm:inline">
                AI-generated · verify results
              </span>
              <div className="grid size-8 place-items-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                FM
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:py-8">
            {children}
          </main>

          <footer className="mx-auto w-full max-w-6xl px-4 pb-8 sm:px-6">
            <ResponsibleAiNotice />
          </footer>
        </div>
      </div>
    </div>
  );
}
