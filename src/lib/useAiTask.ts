import { useServerFn } from "@tanstack/react-start";
import { useCallback, useState } from "react";

import { runAi, type AiRequest } from "./ai.functions";

const FALLBACK = "Something went wrong. Please try again.";

/** Small client-side wrapper around the AI server function: loading + friendly errors. */
export function useAiTask(task: AiRequest["task"]) {
  const run = useServerFn(runAi);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(
    async (payload: Omit<AiRequest, "task">): Promise<string | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await run({ data: { task, ...payload } });
        return result.text;
      } catch (err) {
        const message = err instanceof Error && err.message ? err.message : FALLBACK;
        setError(message.length > 160 ? FALLBACK : message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [run, task],
  );

  return { generate, loading, error, setError };
}
