// Smoke-test the deployed transit-proxy Edge Function.
//
// Usage (Node 20+):
//   node --env-file=.env scripts/test-transit.mjs
//
// It calls each operation the app uses and reports whether real data came
// back, so you can confirm the Metrolinx paths + GO_TRANSIT_API_KEY are right
// without poking around the app. If your project requires a signed-in user,
// set TEST_EMAIL / TEST_PASSWORD for a confirmed account and it will sign in.

import { createClient } from "@supabase/supabase-js";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error(
    "Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY. " +
      "Run with: node --env-file=.env scripts/test-transit.mjs"
  );
  process.exit(1);
}

const supabase = createClient(url, key);

if (process.env.TEST_EMAIL && process.env.TEST_PASSWORD) {
  const { error } = await supabase.auth.signInWithPassword({
    email: process.env.TEST_EMAIL,
    password: process.env.TEST_PASSWORD,
  });
  if (error) console.warn("Sign-in failed, continuing anonymously:", error.message);
  else console.log("Signed in as", process.env.TEST_EMAIL);
}

const call = async (label, body, describe) => {
  const { data, error } = await supabase.functions.invoke("transit-proxy", { body });
  if (error) {
    console.log(`❌ ${label}: ${error.message}`);
    return null;
  }
  const summary = describe(data);
  console.log(`${summary ? "✅" : "⚠️ "} ${label}: ${summary || "no data — check the path"}`);
  return data;
};

// 1) All lines
const lines = await call("lines", { operation: "lines" }, (d) => {
  const list = d?.Lines?.Line ?? d?.Lines ?? [];
  const n = Array.isArray(list) ? list.length : 0;
  return n ? `${n} lines (e.g. ${JSON.stringify(list[0])?.slice(0, 80)}…)` : "";
});

// Try to derive a line + direction for the next call from the response.
const firstLine = (() => {
  const list = lines?.Lines?.Line ?? [];
  return Array.isArray(list) && list[0] ? list[0] : null;
})();
const lineCode = firstLine?.Code ?? firstLine?.LineCode ?? "01";
const direction = firstLine?.Direction ?? "N";

// 2) Stops on a line
const stops = await call(
  "lineStops",
  { operation: "lineStops", lineCode: String(lineCode), direction: String(direction) },
  (d) => {
    const list = d?.Lines?.Stop ?? [];
    return Array.isArray(list) && list.length ? `${list.length} stops on line ${lineCode}/${direction}` : "";
  }
);

// 3) Stop details (use a stop code from the previous call if available)
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
