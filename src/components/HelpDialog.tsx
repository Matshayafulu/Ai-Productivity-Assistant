import { useEffect, useRef } from "react";
import { X } from "lucide-react";

const SECTIONS: Array<{ heading: string; body: string }> = [
  {
    heading: "About the application",
    body: "The AI Workplace Productivity Assistant brings five everyday work tools into one place: an email generator, a meeting notes summarizer, a task planner, a research assistant and THANDI, your AI workplace assistant.",
  },
  {
    heading: "How to use it",
    body: "Choose a tool → enter your information → generate → review the result → edit or copy it. You stay in control of every output.",
  },
  {
    heading: "THANDI",
    body: "THANDI helps with email writing, professional rewriting, meeting preparation, summarizing, task prioritization, productivity planning, brainstorming and general workplace questions.",
  },
  {
    heading: "Activity tracker",
    body: "Meaningful actions are recorded with the exact date and time they happened, so you can review when work was created. Timestamps are captured automatically and never change.",
  },
  {
    heading: "Availability status",
    body: "Set your status in the header. Available means you are available, Away means you are temporarily away, and Busy means you are unavailable or focusing on another task.",
  },
  {
    heading: "Responsible AI",
    body: "AI-generated responses may contain errors or inaccuracies. Review important information before using it in professional, legal, financial, medical or other high-impact situations. Avoid entering confidential or sensitive information unless appropriate.",
  },
];

export function HelpDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        className="absolute inset-0 bg-foreground/40"
        aria-label="Close help"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-title"
        className="glass-panel relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <h2 id="help-title" className="text-base font-semibold text-foreground">
              Help &amp; guidance
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              A quick guide to the workspace, THANDI and your activity trail.
            </p>
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close help"
            className="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-card text-foreground hover:bg-secondary"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto px-5 py-4">
          {SECTIONS.map((section) => (
            <section key={section.heading}>
              <h3 className="text-sm font-semibold text-foreground">{section.heading}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {section.body}
              </p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
