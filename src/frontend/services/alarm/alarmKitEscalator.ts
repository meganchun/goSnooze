import { Platform } from "react-native";
import * as AlarmKit from "expo-alarm-kit";
import { AlarmEscalator } from "./escalator";

// Must match the App Group added to the iOS project (see docs/alarm-escalation.md).
// AlarmKit uses it to share state with its dismiss intent.
const APP_GROUP = "group.com.gosnooze.alarms";

/** iOS major version as a number (0 on other platforms). */
function iosMajorVersion(): number {
  if (Platform.OS !== "ios") return 0;
  const raw = Platform.Version;
  const n = typeof raw === "string" ? parseInt(raw, 10) : raw;
  return Number.isFinite(n) ? (n as number) : 0;
}

let configured = false;
let currentAlarmId: string | null = null;

/**
 * Loud alarm backed by Apple AlarmKit (iOS 26+). Fires a real system alarm
 * that breaks through silent mode and Focus and rings until the user taps
 * "I'm awake". No-ops (falls back) on unsupported OS versions.
 */
export const alarmKitEscalator: AlarmEscalator = {
  isSupported() {
    return iosMajorVersion() >= 26;
  },

  async prepare() {
    if (!this.isSupported() || configured) return;
    try {
      AlarmKit.configure(APP_GROUP);
      await AlarmKit.requestAuthorization();
      configured = true;
    } catch (e) {
      console.warn("AlarmKit prepare failed:", e);
    }
  },

  async startAlarm(label) {
    if (!this.isSupported()) return;
    await this.prepare();
    try {
      const id = AlarmKit.generateUUID();
      currentAlarmId = id;
      // Fire almost immediately — a countdown of ~1s reads as "now".
      await AlarmKit.scheduleAlarm({
        id,
        date: new Date(Date.now() + 1000),
        title: `goSnooze — ${label}`,
        stopButtonLabel: "I'm awake",
        launchAppOnDismiss: true,
        dismissPayload: "arrival-alarm",
        tintColor: "#0057FF",
      });
    } catch (e) {
      console.warn("AlarmKit startAlarm failed:", e);
    }
  },

  async stopAlarm() {
    if (!currentAlarmId) return;
    try {
      await AlarmKit.cancelAlarm(currentAlarmId);
    } catch (e) {
      console.warn("AlarmKit stopAlarm failed:", e);
    }
    currentAlarmId = null;
  },
};
