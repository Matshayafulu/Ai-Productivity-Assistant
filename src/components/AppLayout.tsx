import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import {
  CalendarClock,
  History,
  HelpCircle,
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

import { AvailabilityMenu } from "@/components/AvailabilityMenu";
import { HelpDialog } from "@/components/HelpDialog";
import { supabase } from "@/integrations/supabase/client";
import { initialsOf, useAccount } from "@/lib/useAccount";
import { resetUserStore, setActivityActor, useActivity } from "@/lib/storage";
import { cn } from "@/lib/utils";

export const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/email-generator", label: "Email Generator", icon: Mail },
  { to: "/meeting-summarizer", label: "Meeting Summarizer", icon: MessageSquare },
  { to: "/task-planner", label: "Task Planner", icon: CalendarClock },
  { to: "/research-assistant", label: "Research Assistant", icon: Search },
  { to: "/ai-chat", label: "THANDI", icon: Sparkles },
  { to: "/activity", label: "Activity", icon: History },
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
      id="responsible-ai"
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
          AI-generated responses may contain errors or inaccuracies. Review important
          information before using it in professional, legal, financial, medical or other
          high-impact situations. Avoid entering confidential or sensitive information
          unless appropriate.
        </p>
      </div>
    </section>
  );
}

function SiteFooter({ onHelp }: { onHelp: () => void }) {
  const linkClass =
    "rounded text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline";

  return (
    <footer className="mt-8 border-t border-border pt-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">
            AI Workplace Productivity Assistant
          </p>
          <p className="mt-1 max-w-[46ch] text-sm leading-relaxed text-muted-foreground">
            AI-powered tools for smarter workplace productivity.
          </p>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <a href="#responsible-ai" className={linkClass}>
            Responsible AI
          </a>
          <button type="button" onClick={onHelp} className={linkClass}>
            Help
          </button>
          <Link to="/settings" hash="privacy" className={linkClass}>
            Privacy
          </Link>
          <Link to="/settings" className={linkClass}>
            Settings
          </Link>
        </nav>
      </div>

      <div className="mt-5 flex flex-col gap-1 border-t border-border pt-4 text-xs text-subtle-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 Fulufhelo Matshaya. All rights reserved.</p>
        <p>Designed &amp; Developed by Fulufhelo Matshaya</p>
      </div>
    </footer>
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
  const [helpOpen, setHelpOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, displayName } = useAccount();
  const { items } = useActivity();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const personName = displayName || user?.email?.split("@")[0] || "Signed in";

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    setActivityActor(personName);
  }, [personName]);

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    resetUserStore();
    await supabase.auth.signOut();
    void navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
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
              <div className="mt-4 rounded-xl border border-border bg-card p-3">
                <p className="text-sm font-medium text-foreground">{personName}</p>
                <div className="mt-2">
                  <AvailabilityMenu compact />
                </div>
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
          <header className="glass-panel sticky top-0 z-30 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-none border-x-0 border-t-0 px-4 py-3 sm:px-6">
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              className="grid size-10 place-items-center rounded-lg border border-border bg-card text-foreground lg:hidden"
            >
              <Menu className="size-4" aria-hidden="true" />
            </button>

            <div className="min-w-0">
              <p className="truncate text-[11px] text-subtle-foreground">
                AI Workplace Productivity Assistant
              </p>
              <p className="truncate text-sm font-semibold text-foreground">{breadcrumb}</p>
            </div>

            <div className="ml-auto flex min-w-0 items-center gap-2">
              <Link
                to="/activity"
                aria-label={`Activity — ${items.length} recorded actions`}
                title="Activity"
                className="relative grid size-10 place-items-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-secondary"
              >
                <History className="size-4" aria-hidden="true" />
                {items.length > 0 ? (
                  <span
                    className="absolute -top-1 -right-1 min-w-4 rounded-full bg-primary px-1 text-[10px] leading-4 font-semibold text-primary-foreground"
                    aria-hidden="true"
                  >
                    {items.length > 99 ? "99+" : items.length}
                  </span>
                ) : null}
              </Link>

              <button
                onClick={() => setHelpOpen(true)}
                aria-label="Open help"
                title="Help"
                className="grid size-10 place-items-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-secondary"
              >
                <HelpCircle className="size-4" aria-hidden="true" />
              </button>

              <div className="hidden items-center gap-2 sm:flex">
                <div
                  className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-xs font-semibold text-accent-foreground"
                  aria-hidden="true"
                >
                  {initialsOf(displayName, user?.email)}
                </div>
                <div className="min-w-0 leading-tight">
                  <span className="block truncate text-xs font-medium text-foreground">
                    {personName}
                  </span>
                  <AvailabilityMenu />
                </div>
              </div>

              <button
                onClick={() => void signOut()}
                className="grid size-10 place-items-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-secondary"
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut className="size-4" aria-hidden="true" />
              </button>
            </div>
          </header>

          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:py-8">
            {children}
          </main>

          <div className="mx-auto w-full max-w-6xl px-4 pb-8 sm:px-6">
            <ResponsibleAiNotice />
            <SiteFooter onHelp={() => setHelpOpen(true)} />
          </div>
        </div>
      </div>

      <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
