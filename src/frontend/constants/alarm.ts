// Default distance from the target stop at which we wake the rider (in km).
// This is the single source of truth for both the foreground check
// (HomeScreen) and the background location task (LocationContext).
//
// TODO: once a Supabase project is connected, override this per-user from
// `alert_preferences.radius_km` (see TODO.md P2) instead of using the default.
export const DEFAULT_ARRIVAL_RADIUS_KM = 0.5;
