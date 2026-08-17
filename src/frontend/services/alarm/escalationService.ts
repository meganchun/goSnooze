import { Platform, Vibration } from "react-native";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import { AlarmEscalator } from "./escalator";
import { alarmKitEscalator } from "./alarmKitEscalator";
import { notificationEscalator } from "./notificationEscalator";
import { getCachedAlertPreferences } from "../notificationService";

// Two-stage alarm:
//   Stage 1 (buzzing)  — gentle vibration + a heads-up notification.
//   Stage 2 (alarming) — if not dismissed within the grace window, escalate to
//                        the loud alarm (AlarmKit on iOS 26+, else notifications).
//
// NOTE: the grace timer is a JS setTimeout, which iOS does not run reliably once
// the app is fully suspended. It fires promptly while the app is foregrounded or
// briefly active (e.g. right after a background location update). Precise
// background escalation would schedule the AlarmKit alarm up front for the ETA;
// that's a follow-up — see docs/alarm-escalation.md.

const STAGE1_VIBRATION = [0, 600, 400, 600];
const DEFAULT_GRACE_MS = 30000;

type Stage = "idle" | "buzzing" | "alarming";

// Choose the best supported loud-alarm backend once.
const escalator: AlarmEscalator = alarmKitEscalator.isSupported()
  ? alarmKitEscalator
  : notificationEscalator;

let stage: Stage = "idle";
let graceTimer: ReturnType<typeof setTimeout> | null = null;
let activeLabel = "";

/** Which loud-alarm backend is active — useful for UI/debugging. */
export function getEscalatorKind(): "alarmkit" | "notifications" {
  return alarmKitEscalator.isSupported() ? "alarmkit" : "notifications";
}

/** One-time setup (AlarmKit authorization/config). Call at app start. */
export async function prepareEscalation(): Promise<void> {
  await escalator.prepare();
}

/**
 * Stage 1: buzz + heads-up notification, then start the grace window before
 * escalating. Idempotent while an escalation is already in progress.
 */
export async function beginEscalation(
  label: string,
  graceMs = DEFAULT_GRACE_MS
): Promise<void> {
  if (stage !== "idle") return;
  stage = "buzzing";
  activeLabel = label;

  const prefs = await getCachedAlertPreferences();
  if (prefs.buzzEnabled) {
    Vibration.vibrate(STAGE1_VIBRATION, true);
    if (Platform.OS === "ios") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(
        () => {}
      );
    }
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Almost there 🚉",
      body: `Approaching ${label}. Tap to confirm you're awake.`,
      sound: prefs.soundEnabled,
    },
    trigger: null,
  });

  graceTimer = setTimeout(() => {
    escalate();
  }, graceMs);
}

async function escalate(): Promise<void> {
  if (stage !== "buzzing") return;
  stage = "alarming";
  graceTimer = null;
  Vibration.cancel(); // stage-2 escalator drives its own vibration / alarm
  await escalator.startAlarm(activeLabel);
}

/** Dismiss ("I'm awake") — stop everything at any stage. */
export async function dismissEscalation(): Promise<void> {
  if (graceTimer) {
    clearTimeout(graceTimer);
    graceTimer = null;
  }
  Vibration.cancel();
  await escalator.stopAlarm();
  stage = "idle";
  activeLabel = "";
}

export function getEscalationStage(): Stage {
  return stage;
}

// Back-compat aliases so existing callers keep working.
export const triggerArrivalAlert = (label: string) => beginEscalation(label);
export const stopArrivalAlert = () => {
  // Fire-and-forget to preserve the old synchronous signature.
  void dismissEscalation();
};
