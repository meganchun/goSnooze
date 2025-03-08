import { Location } from "../types/locationTypes";

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
