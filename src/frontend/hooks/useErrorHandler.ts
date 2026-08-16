import { useCallback, useState } from "react";
import { describeError } from "../services/errors";

interface RunOptions {
  /** Message to fall back to if the error can't be described. */
  fallback?: string;
  /** Re-throw after recording, for callers that need to branch on failure. */
  rethrow?: boolean;
}

/**
 * Reusable error-handling for components and contexts. Wrap async work in
 * `run` to get a user-friendly `error` string set automatically (via the
 * extensible `describeError`), or call `fail`/`clearError` directly.
 */
export function useErrorHandler() {
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const fail = useCallback((cause: unknown, fallback?: string) => {
    setError(describeError(cause, fallback));
  }, []);

  const run = useCallback(
    async <T>(fn: () => Promise<T>, options?: RunOptions): Promise<T | undefined> => {
      setError(null);
      try {
        return await fn();
      } catch (cause) {
        setError(describeError(cause, options?.fallback));
        if (options?.rethrow) throw cause;
        return undefined;
      }
    },
    []
  );

  return { error, setError, clearError, fail, run };
}
