import { supabase } from "@/src/backend/supabase";

type TransitOperation = "lines" | "lineStops" | "stopInfo" | "serviceAlerts";

async function requestTransit<T>(
  operation: TransitOperation,
  params: Record<string, string> = {}
): Promise<T> {
  const { data, error } = await supabase.functions.invoke("transit-proxy", {
    body: { operation, ...params },
  });
  if (error) throw error;
  return data as T;
}

export const getLines = () => requestTransit<any>("lines");

export const getStopsOnLine = (lineCode: string, direction: string) =>
  requestTransit<any>("lineStops", { lineCode, direction });

export const getStopDetails = (stopCode: string) =>
  requestTransit<any>("stopInfo", { stopCode });

export const getAlerts = () => requestTransit<any>("serviceAlerts");
