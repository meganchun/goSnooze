// Smoke-test the deployed transit-proxy Edge Function.
//
// Usage (Node 18+):
//   node --env-file=.env scripts/test-transit.mjs
//
// Uses plain fetch (no supabase-js) so it has no Node/WebSocket dependencies.
// It calls each operation the app uses and reports whether real data came back,
// so you can confirm the Metrolinx paths + GO_TRANSIT_API_KEY are right without
// poking around the app. If the function requires a signed-in user, set
// TEST_EMAIL / TEST_PASSWORD for a confirmed account and it will sign in first.

const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error(
    "Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY. " +
      "Run with: node --env-file=.env scripts/test-transit.mjs"
  );
  process.exit(1);
}

// Optionally sign in to get a user JWT (needed if the function verifies JWTs
// and the publishable key alone is rejected).
let bearer = key;
if (process.env.TEST_EMAIL && process.env.TEST_PASSWORD) {
  const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: key, "Content-Type": "application/json" },
    body: JSON.stringify({
      email: process.env.TEST_EMAIL,
      password: process.env.TEST_PASSWORD,
    }),
  });
  const j = await res.json();
  if (j.access_token) {
    bearer = j.access_token;
    console.log("Signed in as", process.env.TEST_EMAIL);
  } else {
    console.warn("Sign-in failed, continuing with the anon key:", j.error_description || j.msg || JSON.stringify(j));
  }
}

const call = async (label, body, describe) => {
  const res = await fetch(`${url}/functions/v1/transit-proxy`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${bearer}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  if (!res.ok) {
    console.log(`❌ ${label}: HTTP ${res.status} — ${typeof data === "string" ? data : JSON.stringify(data)}`);
    return null;
  }
  const summary = describe(data);
  console.log(`${summary ? "✅" : "⚠️ "} ${label}: ${summary || "call ok but shape unrecognized"}`);
  // Always show the real structure so we can see/fix the actual shape.
  const topKeys = data && typeof data === "object" ? Object.keys(data) : [];
  console.log(`    top-level keys: [${topKeys.join(", ")}]`);
  console.log(`    preview: ${JSON.stringify(data).slice(0, 400)}`);
  return data;
};

// 1) All lines
const lines = await call("lines", { operation: "lines" }, (d) => {
  const list = d?.AllLines?.Line ?? [];
  return Array.isArray(list) && list.length ? `${list.length} lines` : "";
});

// Pick a line + a real direction from its Variant list for the next call.
const allLines = lines?.AllLines?.Line ?? [];
const firstLine = allLines.find((l) => l?.Variant?.[0]?.Direction) ?? allLines[0] ?? null;
const lineCode = firstLine?.Code ?? "01";
const direction = firstLine?.Variant?.[0]?.Direction ?? "E";

// 2) Stops on a line
const stops = await call(
  "lineStops",
  { operation: "lineStops", lineCode: String(lineCode), direction: String(direction) },
  (d) => {
    const list = d?.Lines?.Stop ?? [];
    if (Array.isArray(list) && list.length) {
      return `${list.length} stops on line ${lineCode}/${direction}`;
    }
    // 204 = valid response, just no stops for this line/direction today.
    if (d?.Metadata?.ErrorCode === "204") {
      return `no stops for ${lineCode}/${direction} today (path works, 204)`;
    }
    return "";
  }
);

// 3) Stop details
const stopCode = stops?.Lines?.Stop?.[0]?.Code ?? "02799";
await call("stopInfo", { operation: "stopInfo", stopCode: String(stopCode) }, (d) =>
  d?.Stop?.StopName ? `stop ${stopCode} = ${d.Stop.StopName}` : ""
);

// 4) Service alerts
await call("serviceAlerts", { operation: "serviceAlerts" }, (d) => {
  const list = d?.Messages?.Message ?? [];
  return Array.isArray(list) ? `${list.length} alert messages` : "";
});

console.log("\nDone. ✅ = got data, ⚠️ = call succeeded but shape looks off, ❌ = call failed.");
