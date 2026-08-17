import { Vibration } from "react-native";
import * as Notifications from "expo-notifications";
import { AlarmEscalator, ARRIVAL_NOTIFICATION_CATEGORY } from "./escalator";

// Fallback loud alarm for anything without AlarmKit (iOS < 26, Android, Expo Go).
// iOS caps a single notification sound at ~30s and won't loop it, and can't
// override the silent switch without a Critical Alerts entitlement — so we
// approximate an alarm with a burst of loud notifications the OS delivers even
// if the app is suspended, plus continuous vibration.
const ESCALATION_COUNT = 6; // follow-up alerts
const ESCALATION_INTERVAL_S = 5; // seconds apart
const ALARM_VIBRATION = [0, 800, 400, 800, 400, 800];

let scheduledIds: string[] = [];

export const notificationEscalator: AlarmEscalator = {
  isSupported() {
    return true;
  },

  async prepare() {
    // Permissions are requested by notificationService.requestNotificationPermissions.
  },

  async startAlarm(label) {
    Vibration.vibrate(ALARM_VIBRATION, true);
    scheduledIds = [];
    for (let i = 1; i <= ESCALATION_COUNT; i++) {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Wake up! 🚉",
          body: `You're arriving at ${label} — tap to stop.`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
          categoryIdentifier: ARRIVAL_NOTIFICATION_CATEGORY,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: i * ESCALATION_INTERVAL_S,
        },
      });
      scheduledIds.push(id);
    }
  },

  async stopAlarm() {
    Vibration.cancel();
    await Promise.all(
      scheduledIds.map((id) =>
        Notifications.cancelScheduledNotificationAsync(id).catch(() => {})
      )
    );
    scheduledIds = [];
  },
};
