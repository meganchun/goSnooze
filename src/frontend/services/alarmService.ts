import { apiQuery } from "./apiManager";
import { AlarmTarget, setActiveAlarmTarget } from "./notificationService";

type ActiveAlarmRow = {
  user_id: string;
  stop_name: string;
  latitude: number;
  longitude: number;
  radius_km: number;
  enabled: boolean;
};

const toTarget = (row: ActiveAlarmRow): AlarmTarget => ({
  stopName: row.stop_name,
  latitude: row.latitude,
  longitude: row.longitude,
});

/**
 * Arm an alarm: persist it to `active_alarms` (durable, survives reinstall,
 * and can later drive server-sent alerts) and mirror it to the on-device
 * cache the background location task reads.
 */
export async function saveActiveAlarm(
  userId: string,
  target: AlarmTarget,
  radiusKm: number
): Promise<void> {
  await setActiveAlarmTarget(target);
  await apiQuery<ActiveAlarmRow>((c) =>
    c
      .from("active_alarms")
      .upsert({
        user_id: userId,
        stop_name: target.stopName,
        latitude: target.latitude,
        longitude: target.longitude,
        radius_km: radiusKm,
        enabled: true,
      })
      .select()
      .single<ActiveAlarmRow>()
  );
}

/** Disarm the alarm: clear the cache and remove the persisted row. */
export async function clearActiveAlarm(userId: string): Promise<void> {
  await setActiveAlarmTarget(null);
  await apiQuery<null>((c) =>
    c.from("active_alarms").delete().eq("user_id", userId)
  );
}

/** Load a persisted alarm (e.g. after reinstall) and re-seed the cache. */
export async function restoreActiveAlarm(
  userId: string
): Promise<AlarmTarget | null> {
  const row = await apiQuery<ActiveAlarmRow | null>((c) =>
    c
      .from("active_alarms")
      .select("*")
      .eq("user_id", userId)
      .eq("enabled", true)
      .maybeSingle<ActiveAlarmRow>()
  );
  if (!row) return null;
  const target = toTarget(row);
  await setActiveAlarmTarget(target);
  return target;
}
