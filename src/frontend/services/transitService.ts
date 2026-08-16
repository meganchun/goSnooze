import { apiInvoke } from "./apiManager";

type TransitOperation = "lines" | "lineStops" | "stopInfo" | "serviceAlerts";

function requestTransit<T>(
  operation: TransitOperation,
  params: Record<string, string> = {}
): Promise<T> {
  return apiInvoke<T>("transit-proxy", { operation, ...params });
}

export const getLines = () => requestTransit<any>("lines");

export const getStopsOnLine = (lineCode: string, direction: string) =>
  requestTransit<any>("lineStops", { lineCode, direction });

export const getStopDetails = (stopCode: string) =>
  requestTransit<any>("stopInfo", { stopCode });

export const getAlerts = () => requestTransit<any>("serviceAlerts");
