import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { AppLayout } from "@/components/AppLayout";
import { Alert, Button, Card, Field, PageHeader, Select, TextInput } from "@/components/ui-kit";
import { usePersistentState } from "@/lib/storage";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings | AI Workplace Productivity Assistant" },
      {
        name: "description",
        content:
          "Set your default tone and working hours, review responsible AI practices, and clear locally stored data.",
      },
      { property: "og:title", content: "Settings" },
      {
        property: "og:description",
        content: "Preferences, data controls and responsible AI information.",
      },
    ],
  }),
  component: SettingsPage,
});

type Prefs = { name: string; tone: string; hours: string };

const DEFAULTS: Prefs = { name: "", tone: "Professional", hours: "6" };

function SettingsPage() {
  const [prefs, setPrefs] = usePersistentState<Prefs>("settings", DEFAULTS);
  const [saved, setSaved] = useState(false);
  const [cleared, setCleared] = useState(false);

  const clearData = () => {
    if (typeof window !== "undefined") {
      Object.keys(window.localStorage)
        .filter((key) => key.startsWith("awpa:"))
        .forEach((key) => window.localStorage.removeItem(key));
    }
    setPrefs(DEFAULTS);
    setCleared(true);
    setSaved(false);
  };

  return (
    <AppLayout breadcrumb="Settings">
      <PageHeader
        title="Settings"
        subtitle="Set your defaults, understand how your information is handled, and clear anything stored in this browser."
      />

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-base font-semibold text-foreground">Preferences</h2>
          <form
            className="mt-4 flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              setPrefs(prefs);
              setSaved(true);
              setCleared(false);
            }}
          >
            <Field label="Display name" hint="Shown in your workspace only.">
              {(id) => (
                <TextInput
                  id={id}
                  value={prefs.name}
                  onChange={(e) => setPrefs({ ...prefs, name: e.target.value })}
                  placeholder="e.g. Fulufhelo"
                />
              )}
            </Field>

            <Field label="Default email tone">
              {(id) => (
                <Select
                  id={id}
                  value={prefs.tone}
                  onChange={(e) => setPrefs({ ...prefs, tone: e.target.value })}
                >
                  {["Formal", "Friendly", "Persuasive", "Professional", "Apologetic", "Concise"].map(
                    (t) => (
                      <option key={t}>{t}</option>
                    ),
                  )}
                </Select>
              )}
            </Field>

            <Field label="Default working hours per day">
              {(id) => (
                <TextInput
                  id={id}
                  type="number"
                  min={1}
                  max={12}
                  value={prefs.hours}
                  onChange={(e) => setPrefs({ ...prefs, hours: e.target.value })}
                />
              )}
            </Field>

            {saved ? <Alert tone="success" title="Preferences saved." /> : null}

            <Button type="submit" className="w-fit">
              Save preferences
            </Button>
          </form>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <h2 className="text-base font-semibold text-foreground">Your data</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Tasks, generated drafts, chat history and recent activity are stored in this
              browser only. Nothing is saved to an account, and your inputs are sent to the
              AI service only when you press a generate or send button.
            </p>
            {cleared ? (
              <div className="mt-3">
                <Alert tone="success" title="All locally stored data was removed." />
              </div>
            ) : null}
            <Button variant="danger" className="mt-4 w-fit" onClick={clearData}>
              Clear all saved data
            </Button>
          </Card>

          <Card>
            <h2 className="text-base font-semibold text-foreground">
              How this app uses AI responsibly
            </h2>
            <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">Human oversight:</span> every
                result is editable before you use it.
              </li>
              <li>
                <span className="font-medium text-foreground">No fabrication:</span> prompts
                instruct the assistant to use only your facts and to write “Not specified”
                when something is missing.
              </li>
              <li>
                <span className="font-medium text-foreground">Transparency:</span> the
                research tool states clearly that no live sources are retrieved.
              </li>
              <li>
                <span className="font-medium text-foreground">Privacy:</span> avoid entering
                confidential, personal or sensitive information.
              </li>
              <li>
                <span className="font-medium text-foreground">Verification:</span> check
                important output before acting on it.
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
