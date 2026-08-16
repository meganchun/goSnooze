import React, { createContext, useContext, useEffect, useState } from "react";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { calculateDistance } from "../services/distanceService";
import {
  getActiveAlarmTarget,
  triggerArrivalAlert,
} from "../services/notificationService";

interface LocationContextType {
  location: Location.LocationObject | null;
  error: string | null;
}

const LOCATION_TASK_NAME = "background-location-task";

// Distance from the armed stop at which we wake the rider (in km).
const ARRIVAL_RADIUS_KM = 0.5;

// Define background location tracking task. This runs even when the app is
// backgrounded, so it — not the React component — is what wakes a napping rider.
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error("Background location error:", error);
    return;
  }

  if (!data) return;

  const { locations } = data as { locations: Location.LocationObject[] };
  const current = locations?.[locations.length - 1];
  if (!current) return;

  const target = await getActiveAlarmTarget();
  if (!target) return;

  const distanceKm = calculateDistance(
    {
      latitude: current.coords.latitude,
      longitude: current.coords.longitude,
    },
    { latitude: target.latitude, longitude: target.longitude }
  );

  if (distanceKm < ARRIVAL_RADIUS_KM) {
    await triggerArrivalAlert(target.stopName);
  }
});

const LocationContext = createContext<LocationContextType | undefined>(
  undefined
);

export const LocationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let watchSub: Location.LocationSubscription | null = null;

    const startTracking = async () => {
      const { status: foregroundStatus } =
        await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== "granted") {
        setError("Foreground location permission denied");
        return;
      }

      // Seed an initial fix, then keep `location` live in the foreground.
      // watchPositionAsync is what makes the map follow the rider and the
      // proximity check re-fire — and it works even in Expo Go.
      const initial = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(initial);

      watchSub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (loc) => setLocation(loc)
      );

      // Background updates are best-effort: they need "Always" permission and
      // a development build. In Expo Go startLocationUpdatesAsync throws, which
      // we swallow so the foreground experience keeps working.
      const { status: backgroundStatus } =
        await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus !== "granted") {
        setError(
          "Background location off — you'll only be alerted while the app is open."
        );
        return;
      }

      const isTracking = await Location.hasStartedLocationUpdatesAsync(
        LOCATION_TASK_NAME
      ).catch(() => false);
      if (!isTracking) {
        try {
          await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000,
            distanceInterval: 10,
            pausesUpdatesAutomatically: false,
            activityType: Location.ActivityType.OtherNavigation,
            showsBackgroundLocationIndicator: true,
            foregroundService: {
              notificationTitle: "goSnooze is watching your stop",
              notificationBody: "We'll buzz you when you're approaching.",
            },
          });
        } catch (e: any) {
          console.warn(
            "Background location updates unavailable (need a dev build):",
            e?.message
          );
        }
      }
    };

    startTracking().catch((e: any) =>
      setError(e?.message ?? "Location tracking failed to start")
    );

    return () => {
      watchSub?.remove();
    };
  }, []);

  return (
    <LocationContext.Provider value={{ location, error }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};
