// The single choke point every Supabase request goes through. Domain services
// (profile, alert preferences, transit, alarm) call `apiQuery`/`apiInvoke`
// instead of touching the supabase client directly, so error normalization,
// and any future retry/logging/telemetry, lives in one place.

import { supabase } from "@/src/backend/supabase";
import { ApiError } from "./errors";

type SupabaseClient = typeof supabase;

const toApiError = (error: any, fallback: string): ApiError =>
  new ApiError(error?.message ?? fallback, {
    cause: error,
    code: error?.code,
    status: error?.status,
  });

/**
 * Run a Supabase query/mutation/storage call (anything returning
 * `{ data, error }`). Pass a builder so call sites keep full type inference:
 *   apiQuery<Row | null>((c) => c.from("profiles").select("*").eq("id", id).maybeSingle<Row>())
 *
 * Annotate the generic with the data type you expect: `Row` for `.single()`,
 * `Row | null` for `.maybeSingle()`, `null` for a `.delete()`.
 */
export async function apiQuery<T>(
  build: (client: SupabaseClient) => PromiseLike<{ data: T | null; error: unknown }>
): Promise<T> {
  const { data, error } = await build(supabase);
  if (error) throw toApiError(error, "Request failed");
  return data as T;
}

/** Upload bytes to a Storage bucket, normalizing failures into ApiError. */
export async function apiUpload(
  bucket: string,
  path: string,
  body: ArrayBuffer,
  options?: { contentType?: string; upsert?: boolean }
): Promise<void> {
  const { error } = await supabase.storage.from(bucket).upload(path, body, options);
  if (error) throw toApiError(error, "Upload failed");
}

/** Build the public URL for a Storage object (no network request). */
export function apiPublicUrl(bucket: string, path: string): string {
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

/** Invoke a Supabase Edge Function, normalizing failures into ApiError. */
export async function apiInvoke<T>(
  functionName: string,
  body?: Record<string, unknown>
): Promise<T> {
  const { data, error } = await supabase.functions.invoke<T>(functionName, {
    body,
  });
  if (error) throw toApiError(error, `Edge function "${functionName}" failed`);
  return data as T;
}
