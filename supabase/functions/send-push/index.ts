import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Sends a push notification to every device registered for a user.
//
// This uses the SERVICE ROLE key to read other users' push_tokens, so it must
// NOT be callable by clients. Set a PUSH_SEND_SECRET function secret and pass it
// as the `x-push-secret` header; only trusted server callers should know it.
//
// Deploy:
//   supabase secrets set PUSH_SEND_SECRET=$(openssl rand -hex 32)
//   supabase functions deploy send-push
// (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically.)

type SendPushRequest = {
  userId?: string;
  title?: string;
  body?: string;
  data?: Record<string, unknown>;
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

Deno.serve(async (request) => {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const expectedSecret = Deno.env.get("PUSH_SEND_SECRET");
  if (!expectedSecret) return json({ error: "PUSH_SEND_SECRET not configured" }, 500);
  if (request.headers.get("x-push-secret") !== expectedSecret) {
    return json({ error: "Unauthorized" }, 401);
  }

  const { userId, title, body, data } = (await request.json()) as SendPushRequest;
  if (!userId || !title) return json({ error: "userId and title are required" }, 400);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: tokens, error } = await supabase
    .from("push_tokens")
    .select("token")
    .eq("user_id", userId);
  if (error) return json({ error: error.message }, 500);
  if (!tokens?.length) return json({ sent: 0 });

  const messages = tokens.map((t) => ({
    to: t.token,
    title,
    body: body ?? "",
    sound: "default",
    data: data ?? {},
  }));

  const response = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(messages),
  });

  const result = await response.text();
  return new Response(result, {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });
});
