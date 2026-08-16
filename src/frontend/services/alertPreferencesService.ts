import { apiQuery } from "./apiManager";
import {
  AlertPreferences,
  cacheAlertPreferences,
} from "./notificationService";

type AlertPreferencesRow = {
  user_id: string;
  radius_km: number;
  buzz_enabled: boolean;
  sound_enabled: boolean;
};

const toPreferences = (row: AlertPreferencesRow): AlertPreferences => ({
  radiusKm: Number(row.radius_km),
  buzzEnabled: row.buzz_enabled,
  soundEnabled: row.sound_enabled,
});

/**
 * Load the signed-in user's alert preferences from Supabase. A row is created
 * for every user by the `handle_new_user` trigger, but we tolerate its absence.
 * Also refreshes the on-device cache the alarm path reads.
 */
export async function getAlertPreferences(
  userId: string
): Promise<AlertPreferences | null> {
  const row = await apiQuery<AlertPreferencesRow | null>((c) =>
    c
      .from("alert_preferences")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle<AlertPreferencesRow>()
  );
  if (!row) return null;

  const prefs = toPreferences(row);
  await cacheAlertPreferences(prefs);
  return prefs;
}

/**
 * Persist the user's alert preferences and refresh the on-device cache so the
 * foreground and background alarm checks pick them up immediately.
 */
export async function saveAlertPreferences(
  userId: string,
  prefs: AlertPreferences
): Promise<AlertPreferences> {
  const row = await apiQuery<AlertPreferencesRow>((c) =>
    c
      .from("alert_preferences")
      .upsert({
        user_id: userId,
        radius_km: prefs.radiusKm,
        buzz_enabled: prefs.buzzEnabled,
        sound_enabled: prefs.soundEnabled,
      })
      .select()
      .single<AlertPreferencesRow>()
  );

  const saved = toPreferences(row);
  await cacheAlertPreferences(saved);
  return saved;
}
