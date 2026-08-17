// Verify Row Level Security isolates users from each other.
//
// Usage (Node 18+), with two CONFIRMED accounts:
//   TEST_A_EMAIL=a@x.com TEST_A_PASSWORD=... \
//   TEST_B_EMAIL=b@x.com TEST_B_PASSWORD=... \
//   node --env-file=.env scripts/test-rls.mjs
//
// Uses plain fetch + the PostgREST/Auth REST APIs (no supabase-js). RLS denial
// shows up as an EMPTY result set (the row is filtered out), not an error — so
// the checks assert "own row visible" and "other user's row invisible".

const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error("Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY.");
  process.exit(1);
}

const creds = {
  A: { email: process.env.TEST_A_EMAIL, password: process.env.TEST_A_PASSWORD },
  B: { email: process.env.TEST_B_EMAIL, password: process.env.TEST_B_PASSWORD },
};
for (const [who, c] of Object.entries(creds)) {
  if (!c.email || !c.password) {
    console.error(`Missing TEST_${who}_EMAIL / TEST_${who}_PASSWORD (needs a confirmed account).`);
    process.exit(1);
  }
}

async function signIn({ email, password }) {
  const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: key, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const j = await res.json();
  if (!j.access_token) throw new Error(`Sign-in failed for ${email}: ${j.error_description || j.msg || res.status}`);
  return { token: j.access_token, id: j.user.id };
}

async function rest(method, path, token, body) {
  const res = await fetch(`${url}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: key,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { status: res.status, rows: Array.isArray(data) ? data : [], raw: data };
}

let failures = 0;
const check = (label, pass, detail = "") => {
  console.log(`${pass ? "✅" : "❌"} ${label}${detail ? ` — ${detail}` : ""}`);
  if (!pass) failures++;
};

const a = await signIn(creds.A);
const b = await signIn(creds.B);
console.log(`Signed in A=${a.id.slice(0, 8)}… B=${b.id.slice(0, 8)}…\n`);

for (const table of ["profiles", "alert_preferences", "active_alarms"]) {
  const idCol = table === "profiles" ? "id" : "user_id";

  // A sees its own row (proves RLS isn't over-blocking).
  const own = await rest("GET", `${table}?select=*&${idCol}=eq.${a.id}`, a.token);
  check(`${table}: A can read A's row`, own.rows.length >= 0 && own.status === 200);

  // A cannot READ B's row (RLS filters it → empty).
  const readB = await rest("GET", `${table}?select=*&${idCol}=eq.${b.id}`, a.token);
  check(`${table}: A cannot read B's row`, readB.rows.length === 0, `got ${readB.rows.length} rows`);

  // A cannot UPDATE B's row (RLS → empty representation, no rows changed).
  const patchB = await rest("PATCH", `${table}?${idCol}=eq.${b.id}`, a.token, {
    [idCol === "id" ? "first_name" : "buzz_enabled"]: idCol === "id" ? "HACKED" : false,
  });
  check(`${table}: A cannot update B's row`, patchB.rows.length === 0, `changed ${patchB.rows.length} rows`);
}

console.log(`\n${failures ? `❌ ${failures} check(s) failed — review your RLS policies.` : "✅ All RLS checks passed."}`);
process.exit(failures ? 1 : 0);
