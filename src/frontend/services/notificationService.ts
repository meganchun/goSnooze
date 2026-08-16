import { Platform, Vibration } from "react-native";
import * as Notifications from "expo-notifications";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DEFAULT_ARRIVAL_RADIUS_KM } from "../constants/alarm";

// Persisted so the background location task (which runs outside React)
// knows which stop is armed and where it is.
const ACTIVE_ALARM_KEY = "activeAlarmTarget";

// Alert preferences, cached on-device so the background task and the alarm
// path can honor them without a network round-trip. Supabase's
// `alert_preferences` table is the source of truth (see alertPreferencesService).
const ALERT_PREFERENCES_KEY = "alertPreferences";

export interface AlertPreferences {
  radiusKm: number;
  buzzEnabled: boolean;
  soundEnabled: boolean;
}

export const DEFAULT_ALERT_PREFERENCES: AlertPreferences = {
  radiusKm: DEFAULT_ARRIVAL_RADIUS_KM,
  buzzEnabled: true,
  soundEnabled: true,
};

export async function cacheAlertPreferences(
  prefs: AlertPreferences
): Promise<void> {
  try {
    await AsyncStorage.setItem(ALERT_PREFERENCES_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.error("Failed to cache alert preferences:", e);
  }
}

export async function getCachedAlertPreferences(): Promise<AlertPreferences> {
  try {
    const raw = await AsyncStorage.getItem(ALERT_PREFERENCES_KEY);
    return raw
      ? { ...DEFAULT_ALERT_PREFERENCES, ...(JSON.parse(raw) as AlertPreferences) }
      : DEFAULT_ALERT_PREFERENCES;
  } catch (e) {
    console.error("Failed to read alert preferences:", e);
    return DEFAULT_ALERT_PREFERENCES;
  }
}

/** The radius the alarm checks should use, honoring the saved preference. */
export async function getEffectiveRadiusKm(): Promise<number> {
  return (await getCachedAlertPreferences()).radiusKm;
}

export interface AlarmTarget {
  stopName: string;
  latitude: number;
  longitude: number;
}

export async function setActiveAlarmTarget(
  target: AlarmTarget | null
): Promise<void> {
  try {
    if (target) {
      await AsyncStorage.setItem(ACTIVE_ALARM_KEY, JSON.stringify(target));
    } else {
      await AsyncStorage.removeItem(ACTIVE_ALARM_KEY);
    }
  } catch (e) {
    console.error("Failed to persist alarm target:", e);
  }
}

export async function getActiveAlarmTarget(): Promise<AlarmTarget | null> {
  try {
    const raw = await AsyncStorage.getItem(ACTIVE_ALARM_KEY);
    return raw ? (JSON.parse(raw) as AlarmTarget) : null;
  } catch (e) {
    console.error("Failed to read alarm target:", e);
    return null;
  }
}

// Show notifications (with sound) even when the app is foregrounded.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// A repeating buzz pattern meant to wake a napping rider.
// On iOS the individual durations are ignored (the OS uses a fixed pulse),
// but the pattern length and `repeat` flag still drive repeated buzzing.
const ALARM_VIBRATION_PATTERN = [0, 600, 400, 600, 400, 600];

let alertActive = false;

/**
 * Ask the OS for permission to post local notifications.
 * Safe to call more than once. Returns true if granted.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  let status = existing;

  if (existing !== "granted") {
    const { status: requested } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowSound: true,
        allowBadge: false,
      },
    });
    status = requested;
  }

  return status === "granted";
}

/**
 * Fire the "you're approaching your stop" alert: a local notification
 * (sound + banner, works in the background) plus a physical buzz.
 * Idempotent while an alert is already active so we don't stack buzzes.
 */
export async function triggerArrivalAlert(stationName: string): Promise<void> {
  if (alertActive) return;
  alertActive = true;

  const prefs = await getCachedAlertPreferences();

  // Physical buzz (honors the buzz preference).
  if (prefs.buzzEnabled) {
    Vibration.vibrate(ALARM_VIBRATION_PATTERN, true);
    if (Platform.OS === "ios") {
      // Extra strong haptic tap on top of the vibration.
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(
        () => {}
      );
    }
  }

  // Local notification — no server required.
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Almost there! 🚉",
      body: `You're approaching ${stationName}. Time to wake up!`,
      sound: prefs.soundEnabled,
      priority: Notifications.AndroidNotificationPriority.MAX,
    },
    trigger: null, // deliver immediately
  });
}

/**
 * Stop the buzz and reset so a future approach can alert again.
 */
export function stopArrivalAlert(): void {
  Vibration.cancel();
  alertActive = false;
}
