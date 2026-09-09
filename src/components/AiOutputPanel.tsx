import { useState } from "react";
import { Check, Copy, Pencil, RefreshCw, Trash2 } from "lucide-react";

import { Markdown } from "@/components/Markdown";
import { Alert, Button, LoadingState } from "@/components/ui-kit";

type Props = {
  value: string;
  onChange: (next: string) => void;
  onRegenerate: () => void;
  onClear: () => void;
  loading: boolean;
  error: string | null;
  emptyTitle: string;
  emptyHint: string;
  loadingLabel?: string;
};

export function AiOutputPanel({
  value,
  onChange,
  onRegenerate,
  onClear,
  loading,
  error,
  emptyTitle,
  emptyHint,
  loadingLabel,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section aria-label="AI result" className="glass-panel rounded-2xl p-5">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-base font-semibold text-foreground">Result</h2>
        {value && !loading ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-success/40 bg-card px-2.5 py-1 text-xs font-medium text-success">
            <Check className="size-3" aria-hidden="true" />
            Ready to review
          </span>
        ) : null}
        {value ? (
          <div className="ml-auto flex flex-wrap items-center gap-1.5">
            <Button size="sm" variant="secondary" onClick={copy}>
              {copied ? (
                <Check className="size-4" aria-hidden="true" />
              ) : (
                <Copy className="size-4" aria-hidden="true" />
              )}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setEditing((v) => !v)}
              aria-pressed={editing}
            >
              <Pencil className="size-4" aria-hidden="true" />
              {editing ? "Done" : "Edit"}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={onRegenerate}
              disabled={loading}
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              Regenerate
            </Button>
            <Button size="sm" variant="danger" onClick={onClear}>
              <Trash2 className="size-4" aria-hidden="true" />
              Clear
            </Button>
          </div>
        ) : null}
      </div>

      <div className="mt-4">
        {loading ? <LoadingState label={loadingLabel} /> : null}

        {!loading && error ? (
          <Alert tone="error" title="Something went wrong. Please try again.">
            {error}
          </Alert>
        ) : null}

        {!loading && !error && !value ? (
          <div className="rounded-xl border border-dashed border-input bg-card/60 p-6 text-center">
            <p className="text-sm font-semibold text-foreground">{emptyTitle}</p>
            <p className="mx-auto mt-1 max-w-[46ch] text-sm leading-relaxed text-muted-foreground">
              {emptyHint}
            </p>
          </div>
        ) : null}

        {!loading && value ? (
          editing ? (
            <div>
              <label htmlFor="ai-output-editor" className="sr-only">
                Edit the generated result
              </label>
              <textarea
                id="ai-output-editor"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                rows={18}
                className="w-full resize-y rounded-xl border border-input bg-card p-4 font-mono text-[13px] leading-relaxed text-foreground"
              />
              <p className="mt-1.5 text-xs text-subtle-foreground">
                Your edits are kept when you switch back to the formatted view.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-4">
              <Markdown>{value}</Markdown>
            </div>
          )
        ) : null}
      </div>
    </section>
  );
}
