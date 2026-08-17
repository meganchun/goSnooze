# Alarm escalation

goSnooze wakes a rider in two stages so a gentle nudge comes first and a real
alarm only fires if they don't respond.

- **Stage 1 — buzz.** Vibration + a heads-up notification when you enter the
  wake-up radius.
- **Stage 2 — alarm.** If not dismissed within the grace window (~30s), escalate
  to a loud alarm that keeps going until "I'm awake" is tapped.

## Architecture

```
LocationContext / HomeScreen
        │  triggerArrivalAlert(stopName)
        ▼
services/alarm/escalationService.ts   ← state machine: idle → buzzing → alarming
        │  picks the best backend at runtime
        ├── alarmKitEscalator.ts       ← iOS 26+ system alarm (expo-alarm-kit)
        └── notificationEscalator.ts   ← fallback: loud notification burst + vibration
```

Both backends implement the `AlarmEscalator` interface (`escalator.ts`), so the
state machine doesn't care which one runs. `dismissEscalation()` (aliased as
`stopArrivalAlert`) stops everything at any stage.

## Backends

| | AlarmKit (`alarmKitEscalator`) | Notifications (`notificationEscalator`) |
|---|---|---|
| Requires | iOS **26+**, dev build | Nothing extra (works today) |
| Overrides silent / Focus | ✅ system alarm | ❌ |
| Rings until dismissed | ✅ | ⚠️ approximated (burst of ~6 alerts, 5s apart) |

`getEscalatorKind()` reports which one is active.

## Enabling AlarmKit (iOS 26+)

The `expo-alarm-kit` module ships **no config plugin**, so these are manual
native steps done after `expo prebuild` (they are NOT applied automatically):

1. **Deployment target 26.0.** Either bump it in Xcode, or add
   `expo-build-properties` with `ios.deploymentTarget: "26.0"`.
   ⚠️ **Product decision:** this drops every user on iOS < 26. Until you commit
   to that, the app keeps the notification fallback for everyone.
2. **App Group.** In Signing & Capabilities add an App Group whose id matches
   `APP_GROUP` in `alarmKitEscalator.ts` (`group.com.gosnooze.alarms`).
3. **Usage string.** `NSAlarmKitUsageDescription` is already in `app.json`.
4. Rebuild the dev client. `alarmKitEscalator.isSupported()` returns true only on
   iOS 26+, so Stage 2 automatically uses AlarmKit there and falls back elsewhere.

## Known limitations / follow-ups

- **Background timing.** The grace timer is a JS `setTimeout`, which iOS does not
  run reliably once the app is fully suspended. It fires promptly while the app
  is foregrounded or briefly active (e.g. just after a background location
  update). For precise background escalation, schedule the AlarmKit alarm up
  front for the estimated arrival time instead of relying on the timer.
- **Dismiss from a notification.** Today "I'm awake" is the AlarmKit stop button
  or the in-app cancel (`AlarmCard`). Add a notification action / response
  listener to let the fallback path be dismissed from the lock screen.
- **Untested on device.** All of the above type-checks and bundles, but the
  native AlarmKit behavior needs verification on an iOS 26 dev build.
