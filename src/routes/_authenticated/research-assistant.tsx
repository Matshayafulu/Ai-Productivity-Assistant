import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Info, Sparkles } from "lucide-react";

import { AppLayout } from "@/components/AppLayout";
import { AiOutputPanel } from "@/components/AiOutputPanel";
import { Alert, Button, Card, Field, PageHeader, Select, TextArea } from "@/components/ui-kit";
import { useAiTask } from "@/lib/useAiTask";
import { logActivity, usePersistentState } from "@/lib/storage";

export const Route = createFileRoute("/research-assistant")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant | AI Workplace Assistant" },
      {
        name: "description",
        content:
          "Explore a topic and get an AI-generated overview, key findings, considerations, insights and recommendations to verify.",
      },
      { property: "og:title", content: "AI Research Assistant" },
      {
        property: "og:description",
        content: "Structured, verifiable research summaries for workplace topics.",
      },
    ],
  }),
  component: ResearchAssistant,
});

const EMPTY = { topic: "", depth: "Standard", format: "Key Points" };

function ResearchAssistant() {
  const [form, setForm] = useState(EMPTY);
  const [output, setOutput] = usePersistentState<string>("research:output", "");
  const [validation, setValidation] = useState<string | null>(null);
  const { generate, loading, error } = useAiTask("research");

  const submit = async () => {
    if (!form.topic.trim()) {
      setValidation("Please enter a topic before starting the research.");
      return;
    }
    setValidation(null);
    const text = await generate({ fields: form });
    if (text) {
      setOutput(text);
      logActivity("research", "Research completed", form.topic);
    }
  };

  return (
    <AppLayout breadcrumb="Research Assistant">
      <PageHeader
        title="AI Research Assistant"
        subtitle="Ask about a workplace topic and get a structured briefing: overview, findings, considerations, insights and recommendations."
        help="No live internet search is performed. Results come from the AI model's own knowledge and must be verified."
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
            <Field label="What would you like to research?" required>
              {(id) => (
                <TextArea
                  id={id}
                  rows={5}
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  placeholder="e.g. Best practices for hybrid team communication"
                />
              )}
            </Field>

            <Field label="Research Depth">
              {(id) => (
                <Select
                  id={id}
                  value={form.depth}
                  onChange={(e) => setForm({ ...form, depth: e.target.value })}
                >
                  {["Quick", "Standard", "Detailed"].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </Select>
              )}
            </Field>

            <Field label="Output Format">
              {(id) => (
                <Select
                  id={id}
                  value={form.format}
                  onChange={(e) => setForm({ ...form, format: e.target.value })}
                >
                  {["Summary", "Key Points", "Report", "Pros and Cons", "Recommendations"].map(
                    (t) => (
                      <option key={t}>{t}</option>
                    ),
                  )}
                </Select>
              )}
            </Field>

            {validation ? <Alert tone="warning" title={validation} /> : null}

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={loading}>
                <Sparkles className="size-4" aria-hidden="true" />
                {loading ? "Researching…" : "Start Research"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setForm(EMPTY);
                  setOutput("");
                  setValidation(null);
                }}
              >
                Clear
              </Button>
            </div>

            <div className="flex gap-2 rounded-xl border border-primary/30 bg-card p-3 text-sm text-muted-foreground">
              <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              <p className="leading-relaxed">
                AI-generated research summary. No live sources are retrieved. Verify
                important information using reliable sources.
              </p>
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
          emptyTitle="Your research briefing will appear here"
          emptyHint="Enter a topic on the left, choose a depth and format, then select Start Research."
          loadingLabel="Preparing your research briefing…"
        />
      </div>
    </AppLayout>
  );
}
