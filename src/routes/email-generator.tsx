import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles } from "lucide-react";

import { AppLayout } from "@/components/AppLayout";
import { AiOutputPanel } from "@/components/AiOutputPanel";
import { Alert, Button, Card, Field, PageHeader, Select, TextArea, TextInput } from "@/components/ui-kit";
import { useAiTask } from "@/lib/useAiTask";
import { logActivity, usePersistentState } from "@/lib/storage";

export const Route = createFileRoute("/email-generator")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator | AI Workplace Assistant" },
      {
        name: "description",
        content:
          "Generate professional workplace emails: choose recipient, purpose, tone and length, then review, edit and copy the draft.",
      },
      { property: "og:title", content: "Smart Email Generator" },
      {
        property: "og:description",
        content: "Draft workplace emails in seconds, then review and edit before sending.",
      },
    ],
  }),
  component: EmailGenerator,
});

const EMPTY = {
  recipient: "",
  subject: "",
  purpose: "",
  details: "",
  tone: "Professional",
  length: "Standard",
  language: "English",
  cta: "",
};

function EmailGenerator() {
  const [form, setForm] = useState(EMPTY);
  const [output, setOutput] = usePersistentState<string>("email:output", "");
  const [validation, setValidation] = useState<string | null>(null);
  const { generate, loading, error } = useAiTask("email");

  const set = (key: keyof typeof EMPTY) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async () => {
    if (!form.purpose.trim()) {
      setValidation("Please enter the purpose of the email before generating it.");
      return;
    }
    setValidation(null);
    const text = await generate({ fields: form });
    if (text) {
      setOutput(text);
      logActivity("email", "Email generated", form.subject || form.purpose);
    }
  };

  const clearAll = () => {
    setForm(EMPTY);
    setOutput("");
    setValidation(null);
  };

  return (
    <AppLayout breadcrumb="Email Generator">
      <PageHeader
        title="Smart Email Generator"
        subtitle="Describe who you are writing to and what you need to say. The assistant writes a workplace-ready draft in your chosen tone."
        help="Only the facts you enter are used — the assistant will not invent names, dates or commitments."
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
            <Field label="Recipient / Audience">
              {(id) => (
                <TextInput
                  id={id}
                  value={form.recipient}
                  onChange={(e) => set("recipient")(e.target.value)}
                  placeholder="e.g. Marketing team"
                />
              )}
            </Field>

            <Field label="Subject">
              {(id) => (
                <TextInput
                  id={id}
                  value={form.subject}
                  onChange={(e) => set("subject")(e.target.value)}
                  placeholder="e.g. Updated Q3 pricing"
                />
              )}
            </Field>

            <Field label="Purpose of Email" required hint="What should this email achieve?">
              {(id) => (
                <TextArea
                  id={id}
                  rows={3}
                  value={form.purpose}
                  onChange={(e) => set("purpose")(e.target.value)}
                  placeholder="e.g. Share the new pricing and ask for feedback"
                />
              )}
            </Field>

            <Field
              label="Important Details"
              hint="Facts, dates and numbers to keep exactly as written."
            >
              {(id) => (
                <TextArea
                  id={id}
                  rows={4}
                  value={form.details}
                  onChange={(e) => set("details")(e.target.value)}
                  placeholder="e.g. New rates start 1 October. Existing contracts keep current rates."
                />
              )}
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Tone">
                {(id) => (
                  <Select
                    id={id}
                    value={form.tone}
                    onChange={(e) => set("tone")(e.target.value)}
                  >
                    {["Formal", "Friendly", "Persuasive", "Professional", "Apologetic", "Concise"].map(
                      (t) => (
                        <option key={t}>{t}</option>
                      ),
                    )}
                  </Select>
                )}
              </Field>

              <Field label="Email Length">
                {(id) => (
                  <Select
                    id={id}
                    value={form.length}
                    onChange={(e) => set("length")(e.target.value)}
                  >
                    {["Short", "Standard", "Detailed"].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </Select>
                )}
              </Field>

              <Field label="Language">
                {(id) => (
                  <Select
                    id={id}
                    value={form.language}
                    onChange={(e) => set("language")(e.target.value)}
                  >
                    {["English", "Afrikaans", "French", "Spanish", "Portuguese", "German"].map(
                      (t) => (
                        <option key={t}>{t}</option>
                      ),
                    )}
                  </Select>
                )}
              </Field>

              <Field label="Call-to-action">
                {(id) => (
                  <TextInput
                    id={id}
                    value={form.cta}
                    onChange={(e) => set("cta")(e.target.value)}
                    placeholder="e.g. Reply by Friday"
                  />
                )}
              </Field>
            </div>

            {validation ? <Alert tone="warning" title={validation} /> : null}

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={loading}>
                <Sparkles className="size-4" aria-hidden="true" />
                {loading ? "Generating…" : "Generate Email"}
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
          emptyTitle="Your email will appear here"
          emptyHint="Fill in the purpose of the email on the left, then select Generate Email."
          loadingLabel="Writing your email…"
        />
      </div>
    </AppLayout>
  );
}
