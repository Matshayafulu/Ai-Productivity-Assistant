import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, Trash2 } from "lucide-react";

import { AppLayout } from "@/components/AppLayout";
import { Markdown } from "@/components/Markdown";
import { Alert, Button, PageHeader } from "@/components/ui-kit";
import { useAiTask } from "@/lib/useAiTask";
import { logActivity, usePersistentState } from "@/lib/storage";

export const Route = createFileRoute("/_authenticated/ai-chat")({
  head: () => ({
    meta: [
      { title: "AI Workplace Assistant | AI Workplace Assistant" },
      {
        name: "description",
        content:
          "Chat with a workplace productivity assistant for meeting prep, prioritisation, rewriting emails and planning your week.",
      },
      { property: "og:title", content: "AI Workplace Assistant" },
      {
        property: "og:description",
        content: "A chat assistant for everyday workplace productivity.",
      },
    ],
  }),
  component: AiChat,
});

type Message = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Help me prepare for tomorrow's meeting.",
  "Rewrite this email professionally.",
  "Help me prioritize these tasks.",
  "Create a weekly productivity plan.",
];

function AiChat() {
  const [messages, setMessages] = usePersistentState<Message[]>("chat:messages", []);
  const [input, setInput] = useState("");
  const [validation, setValidation] = useState<string | null>(null);
  const { generate, loading, error } = useAiTask("chat");
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, loading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [loading]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) {
      setValidation("Please type a message before sending.");
      return;
    }
    setValidation(null);
    const history = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(history);
    setInput("");

    const reply = await generate({ messages: history.slice(-12) });
    if (reply) {
      setMessages([...history, { role: "assistant", content: reply }]);
      logActivity("chat", "Assistant reply", trimmed);
    }
  };

  return (
    <AppLayout breadcrumb="AI Assistant">
      <PageHeader
        title="AI Workplace Assistant"
        subtitle="Ask for help with emails, prioritisation, meeting prep, brainstorming, summaries and planning."
        help="Your conversation is stored in this browser only. Avoid sharing confidential information."
      />

      <div className="mt-6 flex flex-col gap-4">
        <section
          aria-label="Conversation"
          className="glass-panel flex min-h-[46vh] flex-col gap-4 rounded-2xl p-4 sm:p-5"
        >
          {messages.length === 0 && !loading ? (
            <div className="rounded-xl border border-dashed border-input bg-card/60 p-6 text-center">
              <p className="text-sm font-semibold text-foreground">Start a conversation</p>
              <p className="mx-auto mt-1 max-w-[48ch] text-sm leading-relaxed text-muted-foreground">
                Type a question below, or pick one of the suggested prompts to see what the
                assistant can do.
              </p>
            </div>
          ) : null}

          <ul className="flex flex-col gap-4">
            {messages.map((message, index) => (
              <li
                key={index}
                className={
                  message.role === "user"
                    ? "flex flex-col items-end gap-1"
                    : "flex flex-col gap-1"
                }
              >
                <span className="text-xs font-medium text-subtle-foreground">
                  {message.role === "user" ? "You" : "Assistant"}
                </span>
                {message.role === "user" ? (
                  <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm leading-relaxed text-primary-foreground">
                    {message.content}
                  </p>
                ) : (
                  <div className="max-w-full">
                    <Markdown>{message.content}</Markdown>
                  </div>
                )}
              </li>
            ))}
          </ul>

          {loading ? (
            <p
              className="text-sm font-medium text-muted-foreground"
              role="status"
              aria-live="polite"
            >
              <span
                className="shimmer mr-2 inline-block size-3 rounded-full bg-primary/40 align-middle"
                aria-hidden="true"
              />
              Thinking…
            </p>
          ) : null}

          {error ? (
            <Alert tone="error" title="Something went wrong. Please try again.">
              {error}
            </Alert>
          ) : null}

          <div ref={endRef} />
        </section>

        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => void send(s)}
              disabled={loading}
              className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-60"
            >
              {s}
            </button>
          ))}
        </div>

        {validation ? <Alert tone="warning" title={validation} /> : null}

        <form
          className="glass-panel flex flex-col gap-3 rounded-2xl p-4"
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
        >
          <label htmlFor="chat-input" className="text-sm font-medium text-foreground">
            Your message
          </label>
          <textarea
            id="chat-input"
            ref={inputRef}
            rows={3}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send(input);
              }
            }}
            placeholder="e.g. Help me plan a productive Monday around two client calls"
            className="w-full resize-y rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-subtle-foreground"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" disabled={loading}>
              <Send className="size-4" aria-hidden="true" />
              {loading ? "Sending…" : "Send"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setMessages([]);
                setValidation(null);
              }}
              disabled={messages.length === 0}
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Clear conversation
            </Button>
            <span className="ml-auto hidden items-center gap-1.5 text-xs text-subtle-foreground sm:flex">
              <Sparkles className="size-3" aria-hidden="true" />
              Enter to send · Shift + Enter for a new line
            </span>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
