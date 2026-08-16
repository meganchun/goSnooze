// Centralized, extensible error handling.
//
// `ApiError` is the normalized error every request layer throws (see
// apiManager). `describeError` turns any thrown value into a user-friendly
// message using an ordered list of rules; register domain-specific rules with
// `registerErrorRule` to extend it without touching this file.

export class ApiError extends Error {
  readonly cause?: unknown;
  readonly code?: string;
  readonly status?: number;

  constructor(
    message: string,
    options?: { cause?: unknown; code?: string; status?: number }
  ) {
    super(message);
    this.name = "ApiError";
    this.cause = options?.cause;
    this.code = options?.code;
    this.status = options?.status;
  }
}

/** Return a user-facing message for the error, or undefined to defer. */
export type ErrorRule = (error: unknown, message: string) => string | undefined;

const customRules: ErrorRule[] = [];

/** Add a rule that takes precedence over the built-in defaults. */
export function registerErrorRule(rule: ErrorRule): void {
  customRules.push(rule);
}

const defaultRules: ErrorRule[] = [
  (_e, m) => (/invalid login/i.test(m) ? "Invalid email or password." : undefined),
  (_e, m) =>
    /already registered|already in use/i.test(m)
      ? "That email is already in use."
      : undefined,
  (_e, m) =>
    /rate limit|too many/i.test(m)
      ? "Too many attempts. Please try again shortly."
      : undefined,
  (_e, m) =>
    /expired/i.test(m) ? "That code has expired. Request a new one." : undefined,
  (_e, m) =>
    /invalid otp|invalid token|incorrect.*code|token has expired/i.test(m)
      ? "That code is incorrect. Please try again."
      : undefined,
  (_e, m) =>
    /network|failed to fetch|timeout|fetch failed/i.test(m)
      ? "Network problem. Check your connection and try again."
      : undefined,
];

function rawMessage(error: unknown): string {
  if (!error) return "";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message ?? "");
  }
  return String(error);
}

export function describeError(
  error: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  const message = rawMessage(error);
  for (const rule of [...customRules, ...defaultRules]) {
    const result = rule(error, message);
    if (result) return result;
  }
  return message || fallback;
}
