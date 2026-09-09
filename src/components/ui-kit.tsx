import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { useId } from "react";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";

import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------- Buttons */

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        size === "sm" ? "px-3 py-1.5 text-sm" : "px-4 py-2.5 text-sm",
        variant === "primary" &&
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover",
        variant === "secondary" &&
          "border border-border bg-card text-foreground hover:bg-secondary",
        variant === "ghost" && "text-primary hover:bg-accent",
        variant === "danger" &&
          "border border-border bg-card text-destructive hover:bg-secondary",
        className,
      )}
      {...props}
    />
  );
}

/* ------------------------------------------------------------------ Cards */

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("glass-panel rounded-2xl p-5", className)}>{children}</div>
  );
}

export function SectionTitle({
  title,
  description,
  className,
}: {
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      {description ? (
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  help,
}: {
  title: string;
  subtitle: string;
  help?: string;
}) {
  return (
    <header className="anim-in">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {title}
      </h1>
      <p className="mt-2 max-w-[64ch] text-sm leading-relaxed text-muted-foreground sm:text-base">
        {subtitle}
      </p>
      {help ? (
        <p className="mt-1 max-w-[64ch] text-sm leading-relaxed text-subtle-foreground">
          {help}
        </p>
      ) : null}
    </header>
  );
}

/* ------------------------------------------------------------ Form fields */

type FieldProps = {
  label: string;
  hint?: string;
  required?: boolean;
  children: (id: string) => ReactNode;
};

export function Field({ label, hint, required, children }: FieldProps) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
        {required ? (
          <span className="ml-1 text-destructive" aria-hidden="true">
            *
          </span>
        ) : null}
        {required ? <span className="sr-only"> (required)</span> : null}
      </label>
      {children(id)}
      {hint ? (
        <p className="mt-1 text-xs leading-relaxed text-subtle-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

const controlClass =
  "w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-subtle-foreground focus:border-primary";

export function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(controlClass, className)} {...props} />;
}

export function TextArea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(controlClass, "resize-y", className)} {...props} />;
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(controlClass, className)} {...props}>
      {children}
    </select>
  );
}

/* ----------------------------------------------------------------- States */

export function LoadingState({ label = "Generating your response…" }: { label?: string }) {
  return (
    <div
      className="rounded-xl border border-border bg-card p-4"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <span
          className="shimmer inline-block size-3 rounded-full bg-primary/40"
          aria-hidden="true"
        />
        {label}
      </div>
      <div className="mt-3 flex flex-col gap-2" aria-hidden="true">
        <div className="shimmer h-3 w-3/4 rounded bg-secondary" />
        <div className="shimmer h-3 w-full rounded bg-secondary" />
        <div className="shimmer h-3 w-2/3 rounded bg-secondary" />
      </div>
    </div>
  );
}

export function Alert({
  tone,
  title,
  children,
}: {
  tone: "error" | "success" | "info" | "warning";
  title: string;
  children?: ReactNode;
}) {
  const Icon =
    tone === "success" ? CheckCircle2 : tone === "info" ? Info : AlertTriangle;
  const toneClass =
    tone === "error"
      ? "border-destructive/40 text-destructive"
      : tone === "success"
        ? "border-success/40 text-success"
        : tone === "warning"
          ? "border-warning/40 text-warning"
          : "border-primary/30 text-primary";

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("flex gap-3 rounded-xl border bg-card p-3", toneClass)}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-sm font-semibold">{title}</p>
        {children ? (
          <div className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
            {children}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-input bg-card/60 p-6 text-center">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mx-auto mt-1 max-w-[46ch] text-sm leading-relaxed text-muted-foreground">
        {children}
      </p>
    </div>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  const p = priority.toLowerCase();
  const style =
    p === "high"
      ? "border-destructive/40 text-destructive"
      : p === "low"
        ? "border-border text-muted-foreground"
        : "border-warning/40 text-warning";
  const mark = p === "high" ? "!!" : p === "low" ? "·" : "!";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border bg-card px-2 py-0.5 text-xs font-medium",
        style,
      )}
    >
      <span aria-hidden="true">{mark}</span>
      {priority}
    </span>
  );
}
