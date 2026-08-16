import "jsr:@supabase/functions-js/edge-runtime.d.ts";

type TransitRequest = {
  operation?: "lines" | "lineStops" | "stopInfo" | "serviceAlerts";
  lineCode?: string;
  direction?: string;
  stopCode?: string;
};

// Public Metrolinx / GO Open Data API endpoints. These are not secrets — they
// are the same published paths for every consumer — so they live in code.
// Verify against https://api.openmetrolinx.com if the API changes.
const BASE_URL = "https://api.openmetrolinx.com/OpenDataAPI";
const PATHS = {
  trainLines: "/api/V1/Schedule/Line/All/",
  lineStops: "/api/V1/Schedule/Line/Stop/",
  stopInfo: "/api/V1/Stop/Details",
  serviceAlerts: "/api/V1/ServiceUpdate/ServiceAlert/All",
};

// The API key is the only real secret. Store it raw (no "?key=" prefix).
const apiKey = Deno.env.get("GO_TRANSIT_API_KEY");

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

Deno.serve(async (request) => {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!apiKey) return json({ error: "Missing GO_TRANSIT_API_KEY secret." }, 500);

  try {
    const input = (await request.json()) as TransitRequest;
    const today = new Date().toISOString().slice(0, 10).replaceAll("-", "");
    const key = `?key=${apiKey}`;

    let endpoint: string;
    switch (input.operation) {
      case "lines":
        endpoint = `${PATHS.trainLines}${today}${key}`;
        break;
      case "lineStops":
        if (!input.lineCode || !input.direction) {
          return json({ error: "lineCode and direction are required" }, 400);
        }
        endpoint = `${PATHS.lineStops}${today}/${encodeURIComponent(input.lineCode)}/${encodeURIComponent(input.direction)}${key}`;
        break;
      case "stopInfo":
        if (!input.stopCode) return json({ error: "stopCode is required" }, 400);
        endpoint = `${PATHS.stopInfo}/${encodeURIComponent(input.stopCode)}${key}`;
        break;
      case "serviceAlerts":
        endpoint = `${PATHS.serviceAlerts}${key}`;
        break;
      default:
        return json({ error: "Unsupported transit operation" }, 400);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: { Accept: "application/json" },
    });
    const body = await response.text();
    return new Response(body, {
      status: response.status,
      headers: { "Content-Type": response.headers.get("content-type") || "application/json" },
    });
  } catch (cause) {
    console.error("transit-proxy failed", cause);
    return json({ error: "Transit service is unavailable" }, 502);
  }
});
