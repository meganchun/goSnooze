import dayjs from "dayjs";
import { Location } from "../types/locationTypes";

// Rough average GO train speed including station dwell time (km/h). Used only
// for an estimated arrival time, so it doesn't need to be exact.
const AVERAGE_SPEED_KMH = 60;

/**
 * Estimate a clock-time arrival from the remaining straight-line distance.
 * Returns a formatted time like "10:52 AM". This is an estimate, not schedule
 * data — the UI labels it as such.
 */
export const estimateArrival = (
  distanceKm: number,
  speedKmh = AVERAGE_SPEED_KMH
): string => {
  const minutes = (distanceKm / speedKmh) * 60;
  return dayjs().add(minutes, "minute").format("h:mm A");
};

export const calculateDistance = (current: Location, destination: Location) => {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(destination.latitude - current.latitude); // deg2rad below
  var dLon = deg2rad(destination.longitude - current.longitude);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(current.latitude)) *
      Math.cos(deg2rad(destination.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d;
};

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}
