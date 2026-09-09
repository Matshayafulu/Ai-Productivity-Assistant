import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles } from "lucide-react";

import { AppLayout } from "@/components/AppLayout";
import { AiOutputPanel } from "@/components/AiOutputPanel";
import { Alert, Button, Card, Field, PageHeader, TextArea, TextInput } from "@/components/ui-kit";
import { useAiTask } from "@/lib/useAiTask";
import { logActivity, usePersistentState } from "@/lib/storage";

export const Route = createFileRoute("/_authenticated/meeting-summarizer")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer | AI Workplace Assistant" },
      {
        name: "description",
        content:
          "Paste meeting notes and get a summary, key decisions and an action-item table with owners and deadlines.",
      },
      { property: "og:title", content: "Meeting Notes Summarizer" },
      {
        property: "og:description",
        content: "Turn lengthy meeting notes into summaries and clear action items.",
      },
    ],
  }),
  component: MeetingSummarizer,
});

const EMPTY = { title: "", participants: "", date: "", notes: "" };

function MeetingSummarizer() {
  const [form, setForm] = useState(EMPTY);
  const [output, setOutput] = usePersistentState<string>("meeting:output", "");
  const [validation, setValidation] = useState<string | null>(null);
  const { generate, loading, error } = useAiTask("meeting");

  const set = (key: keyof typeof EMPTY) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async () => {
    if (form.notes.trim().length < 20) {
      setValidation("Please paste your meeting notes before summarizing.");
      return;
    }
    setValidation(null);
    const text = await generate({ fields: form });
    if (text) {
      setOutput(text);
      logActivity("meeting", "Meeting summarized", form.title || "Untitled meeting");
    }
  };

  const clearAll = () => {
    setForm(EMPTY);
    setOutput("");
    setValidation(null);
  };

  return (
    <AppLayout breadcrumb="Meeting Summarizer">
      <PageHeader
        title="Meeting Notes Summarizer"
        subtitle="Paste your raw meeting notes. You get a short summary, the decisions taken and an action-item table you can share."
        help="Owners and deadlines are taken from your notes only. Anything missing is shown as “Not specified”."
      />

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[360px_1fr]">
        <Card>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
          >
            <Field label="Meeting Title" hint="Optional">
              {(id) => (
                <TextInput
                  id={id}
                  value={form.title}
                  onChange={(e) => set("title")(e.target.value)}
                  placeholder="e.g. Weekly design sync"
                />
              )}
            </Field>

            <Field label="Participants" hint="Optional">
              {(id) => (
                <TextInput
                  id={id}
                  value={form.participants}
                  onChange={(e) => set("participants")(e.target.value)}
                  placeholder="e.g. Thabo, Sarah, Dev team"
                />
              )}
            </Field>

            <Field label="Date" hint="Optional">
              {(id) => (
                <TextInput
                  id={id}
                  type="date"
                  value={form.date}
                  onChange={(e) => set("date")(e.target.value)}
                />
              )}
            </Field>

            <Field label="Meeting Notes" required>
              {(id) => (
                <TextArea
                  id={id}
                  rows={12}
                  value={form.notes}
                  onChange={(e) => set("notes")(e.target.value)}
                  placeholder="Paste your notes, transcript or bullet points here…"
                />
              )}
            </Field>

            {validation ? <Alert tone="warning" title={validation} /> : null}

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={loading}>
                <Sparkles className="size-4" aria-hidden="true" />
                {loading ? "Summarizing…" : "Summarize Meeting"}
              </Button>
              <Button type="button" variant="secondary" onClick={clearAll}>
                Clear
              </Button>
            </div>
          </form>
        </Card>

        <AiOutputPanel
          value={output}
          onChange={setOutput}
          onRegenerate={() => void submit()}
          onClear={() => setOutput("")}
          loading={loading}
          error={error}
          emptyTitle="Your summary will appear here"
          emptyHint="Paste your meeting notes on the left, then select Summarize Meeting."
          loadingLabel="Summarizing your meeting…"
        />
      </div>
    </AppLayout>
  );
}
