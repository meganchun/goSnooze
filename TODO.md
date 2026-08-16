# goSnooze To-Do

Status verified against the codebase on 2026-08-16. Items marked `[x]` were
confirmed present in code; `[~]` means the code is written but not yet
verifiable (needs the live Supabase project and/or on-device testing).

## P0 — Migrate from Firebase to Supabase

Move the app to Supabase before further Firebase feature work, using Supabase
Auth, Postgres, Row Level Security (RLS), Storage, and Edge Functions.

- [ ] Create the Supabase project and configure Auth providers: phone OTP,
      email/password, and Google. (Dashboard config — code already supports all
      three.)
- [ ] Configure an SMS provider in Supabase Auth with rate limiting, OTP expiry,
      and CAPTCHA. Keep all provider credentials server-side. (Dashboard config.)
- [x] Data-model migration for `profiles`, `alert_preferences`,
      `active_alarms`, and `push_tokens`, all keyed by `auth.users.id`.
- [x] Owner-only RLS policies for every user-owned table and Storage bucket.
- [x] React Native Supabase client with persisted AsyncStorage sessions and
      auth-state handling.
- [x] Replace Firebase Auth and Firestore in `AuthContext` with Supabase Auth
      and the `profiles` table; phone OTP, email/password, and Google resolve to
      one user identity.
- [x] Move profile image uploads to Supabase Storage.
- [x] Move protected transit requests to a Supabase Edge Function
      (`transit-proxy`); credentials stay out of the client bundle.
- [ ] Move future Twilio and remote-push delivery to Supabase Edge Functions.
      (Only `transit-proxy` exists so far.)
- [ ] Require existing users to reverify their phone number during cutover; do
      not attempt to carry Firebase sessions forward.
- [~] Verify the migrated app on iOS and Android, then finish removing dead
      code and obsolete dependencies. (Firebase/Prisma/Apollo/GraphQL files and
      deps removed; `react-native-auth0` removed; `expo-web-browser`/
      `expo-file-system` pinned to SDK-52 versions. Still needs on-device
      verification; the app cannot boot until the Supabase env vars are set.)

## P1 — Authentication and OTP correctness

- [~] Persistent sessions, OTP resend/expiry/error states, and launch-time auth
      restoration are implemented in the new `AuthContext`. Pending: the P0
      provider config and on-device verification.

## P2 — Polish and incomplete screens

- [x] Notifications settings screen for buzz, sound, and alert radius, backed by
      `alert_preferences` (`NotificationsScreen`, `alertPreferencesService`),
      reachable from Settings. Pending on-device verification.
- [x] Apply the saved radius and buzz/sound in the foreground and background
      alarm checks. Preferences are cached on-device (`getCachedAlertPreferences`
      / `getEffectiveRadiusKm`) so the background task honors them too. Pending
      on-device verification.
- [x] Persist the armed alarm to the `active_alarms` table (via `alarmService`)
      while keeping the AsyncStorage cache the background task reads. Pending
      on-device verification.
- [x] Replace the fabricated alarm ETA in `AlarmCard` with an estimate from the
      remaining distance (`estimateArrival`). Greeting reads from the user.
- [ ] Add secrets scanning and verify data-access (RLS) policies against the
      live project.

## Architecture

- [x] Central API manager (`services/apiManager.ts`): every data request
      (`apiQuery`/`apiInvoke`/`apiUpload`/`apiPublicUrl`) goes through it and
      normalizes failures into `ApiError`. Auth stays in `AuthContext`.
- [x] Extensible error handling: `services/errors.ts` (`describeError` +
      `registerErrorRule`) with the `useErrorHandler` hook used by screens and
      contexts.

## P3 — Optional server-sent alerts

- [ ] Set up APNs credentials, device token registration (`push_tokens`), and a
      trusted push sender after the Supabase migration is stable.
