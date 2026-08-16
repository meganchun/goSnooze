import "jsr:@supabase/functions-js/edge-runtime.d.ts";

type TransitRequest = {
  operation?: "lines" | "lineStops" | "stopInfo" | "serviceAlerts";
  lineCode?: string;
  direction?: string;
  stopCode?: string;
};

const required = (name: string): string => {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing ${name} function secret.`);
  return value;
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

Deno.serve(async (request) => {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const input = (await request.json()) as TransitRequest;
    const baseUrl = required("GO_TRANSIT_API_BASE_URL").replace(/\/$/, "");
    const apiKey = required("GO_TRANSIT_API_KEY");
    const today = new Date().toISOString().slice(0, 10).replaceAll("-", "");
    const paths = {
      trainLines: required("GO_TRANSIT_TRAIN_LINES"),
      lineStops: required("GO_TRANSIT_LINE_STOPS"),
      stopInfo: required("GO_TRANSIT_STOP_INFO"),
      serviceAlerts: required("GO_TRANSIT_SERVICE_ALERTS"),
    };

    let endpoint: string;
    switch (input.operation) {
      case "lines":
        endpoint = `${paths.trainLines}${today}${apiKey}`;
        break;
      case "lineStops":
        if (!input.lineCode || !input.direction) {
          return json({ error: "lineCode and direction are required" }, 400);
        }
        endpoint = `${paths.lineStops}${today}/${encodeURIComponent(input.lineCode)}/${encodeURIComponent(input.direction)}${apiKey}`;
        break;
      case "stopInfo":
        if (!input.stopCode) return json({ error: "stopCode is required" }, 400);
        endpoint = `${paths.stopInfo}/${encodeURIComponent(input.stopCode)}${apiKey}`;
        break;
      case "serviceAlerts":
        endpoint = `${paths.serviceAlerts}${apiKey}`;
        break;
      default:
        return json({ error: "Unsupported transit operation" }, 400);
    }

    const response = await fetch(`${baseUrl}${endpoint}`, {
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
