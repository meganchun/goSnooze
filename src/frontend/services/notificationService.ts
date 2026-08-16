import { Platform, Vibration } from "react-native";
import * as Notifications from "expo-notifications";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Persisted so the background location task (which runs outside React)
// knows which stop is armed and where it is.
const ACTIVE_ALARM_KEY = "activeAlarmTarget";

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

  // Physical buzz.
  Vibration.vibrate(ALARM_VIBRATION_PATTERN, true);
  if (Platform.OS === "ios") {
    // Extra strong haptic tap on top of the vibration.
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(
      () => {}
    );
  }

  // Local notification — no server required.
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Almost there! 🚉",
      body: `You're approaching ${stationName}. Time to wake up!`,
      sound: true,
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
