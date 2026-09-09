import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Alert, Button, Field, TextInput } from "@/components/ui-kit";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in | AI Workplace Productivity Assistant" },
      {
        name: "description",
        content:
          "Sign in or create an account to keep your generated emails, meeting summaries, schedules and chat history private and saved.",
      },
      { property: "og:title", content: "Sign in to AI Workplace Assistant" },
      {
        property: "og:description",
        content: "Private, saved workspace for your AI-generated work.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => {
      if (data.user) void navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setInfo(null);

    if (!email.trim() || !password) {
      setError("Please enter your email address and password.");
      return;
    }
    if (mode === "signup" && password.length < 6) {
      setError("Please choose a password with at least 6 characters.");
      return;
    }

    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: displayName.trim() || email.split("@")[0] },
          },
        });
        if (signUpError) {
          setError(signUpError.message);
          return;
        }
        if (!data.session) {
          setInfo(
            "Account created. Check your inbox and click the confirmation link, then sign in.",
          );
          setMode("signin");
          return;
        }
        void navigate({ to: "/dashboard", replace: true });
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) {
        setError(
          signInError.message === "Invalid login credentials"
            ? "That email address and password do not match an account."
            : signInError.message,
        );
        return;
      }
      void navigate({ to: "/dashboard", replace: true });
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 -left-24 size-[520px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 -right-32 size-[460px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center gap-2.5">
          <div className="grid size-9 place-items-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
            A
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-foreground">AI Workplace</p>
            <p className="text-[11px] text-subtle-foreground">Productivity Assistant</p>
          </div>
        </div>

        <section className="glass-panel rounded-2xl p-6">
          <h1 className="text-xl font-semibold text-foreground">
            {mode === "signin" ? "Sign in to your workspace" : "Create your workspace"}
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            Your emails, meeting summaries, schedules and chat history are saved to your
            account and visible only to you.
          </p>

          <form className="mt-5 flex flex-col gap-4" onSubmit={submit}>
            {mode === "signup" ? (
              <Field label="Display name" hint="Shown in your workspace.">
                {(id) => (
                  <TextInput
                    id={id}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Fulufhelo Matshaya"
                    autoComplete="name"
                  />
                )}
              </Field>
            ) : null}

            <Field label="Email address" required>
              {(id) => (
                <TextInput
                  id={id}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                />
              )}
            </Field>

            <Field
              label="Password"
              required
              hint={mode === "signup" ? "At least 6 characters." : undefined}
            >
              {(id) => (
                <TextInput
                  id={id}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                />
              )}
            </Field>

            {error ? <Alert tone="error" title={error} /> : null}
            {info ? <Alert tone="success" title={info} /> : null}

            <Button type="submit" disabled={busy}>
              {busy
                ? "Please wait…"
                : mode === "signin"
                  ? "Sign in"
                  : "Create account"}
            </Button>
          </form>

          <p className="mt-4 text-sm text-muted-foreground">
            {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setError(null);
                setInfo(null);
              }}
              className="font-semibold text-primary underline underline-offset-2"
            >
              {mode === "signin" ? "Create an account" : "Sign in instead"}
            </button>
          </p>
        </section>

        <p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
          <ShieldAlert className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
          AI-generated content may contain errors. Review important information before use,
          and avoid entering confidential details.
        </p>
      </div>
    </main>
  );
}
