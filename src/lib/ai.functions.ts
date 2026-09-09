import { createServerFn } from "@tanstack/react-start";
import { streamText } from "ai";
import { z } from "zod";

import {
  CHAT_SYSTEM,
  buildEmailPrompt,
  buildMeetingPrompt,
  buildPlannerPrompt,
  buildResearchPrompt,
} from "./prompts";

const fields = z.record(z.string());

const RequestSchema = z.object({
  task: z.enum(["email", "meeting", "planner", "research", "chat"]),
  fields: fields.optional(),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      }),
    )
    .optional(),
});

export type AiRequest = z.infer<typeof RequestSchema>;

const FRIENDLY = {
  config: "The AI service isn't configured right now. Please try again later.",
  credits:
    "The AI service has run out of credits for this workspace. Please add credits and try again.",
  blocked: "The AI service is unavailable for this workspace right now.",
  busy: "The AI service is busy at the moment. Please wait a few seconds and try again.",
  generic: "Something went wrong while generating your response. Please try again.",
};

function friendlyMessage(error: unknown): string {
  const status = (error as { statusCode?: number; status?: number } | null)?.statusCode ??
    (error as { status?: number } | null)?.status;
  if (status === 402) return FRIENDLY.credits;
  if (status === 403 || status === 401) return FRIENDLY.blocked;
  if (status === 429 || (typeof status === "number" && status >= 500)) return FRIENDLY.busy;
  return FRIENDLY.generic;
}

/**
 * Single AI entry point for every tool. All prompt construction happens here,
 * on the server, so a future model/provider swap needs no UI changes.
 */
export const runAi = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => RequestSchema.parse(input))
  .handler(async ({ data }): Promise<{ text: string }> => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error(FRIENDLY.config);

    const f = (data.fields ?? {}) as Record<string, string>;
    const get = (key: string) => f[key] ?? "";

    let system: string;
    const messages: Array<{ role: "user" | "assistant"; content: string }> = [];

    switch (data.task) {
      case "email": {
        const p = buildEmailPrompt({
          recipient: get("recipient"),
          subject: get("subject"),
          purpose: get("purpose"),
          details: get("details"),
          tone: get("tone"),
          length: get("length"),
          language: get("language"),
          cta: get("cta"),
        });
        system = p.system;
        messages.push({ role: "user", content: p.user });
        break;
      }
      case "meeting": {
        const p = buildMeetingPrompt({
          title: get("title"),
          participants: get("participants"),
          date: get("date"),
          notes: get("notes"),
        });
        system = p.system;
        messages.push({ role: "user", content: p.user });
        break;
      }
      case "planner": {
        const p = buildPlannerPrompt({
          mode: get("mode"),
          hours: get("hours"),
          startTime: get("startTime"),
          tasks: get("tasks"),
        });
        system = p.system;
        messages.push({ role: "user", content: p.user });
        break;
      }
      case "research": {
        const p = buildResearchPrompt({
          topic: get("topic"),
          depth: get("depth"),
          format: get("format"),
        });
        system = p.system;
        messages.push({ role: "user", content: p.user });
        break;
      }
      case "chat": {
        system = CHAT_SYSTEM;
        for (const m of data.messages ?? []) messages.push(m);
        break;
      }
    }

    if (messages.length === 0) throw new Error(FRIENDLY.generic);

    try {
      const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
      const gateway = createLovableAiGatewayProvider(apiKey);
      const result = streamText({
        model: gateway("google/gemini-3.8-flash"),
        system,
        messages,
      });
      const text = await result.text;
      if (!text.trim()) throw new Error(FRIENDLY.generic);
      return { text };
    } catch (error) {
      console.error("AI request failed", error);
      throw new Error(friendlyMessage(error));
    }
  });
