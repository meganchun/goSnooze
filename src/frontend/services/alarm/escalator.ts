// A pluggable "loud alarm" backend used as the escalation stage — the thing
// that actually wakes a rider who didn't respond to the initial buzz.
//
// Two implementations sit behind this interface:
//   - alarmKitEscalator      (iOS 26+, real system alarm that breaks through
//                             silent mode / Focus and rings until dismissed)
//   - notificationEscalator  (everything else: a burst of loud notifications +
//                             strong vibration; best-effort, no special OS help)
//
// escalationService picks the best supported one at runtime.

export interface AlarmEscalator {
  /** Whether this escalator's loud alarm can actually run on this device. */
  isSupported(): boolean;
  /** One-time setup (permissions/config). Safe to call repeatedly. */
  prepare(): Promise<void>;
  /** Start the loud alarm; it should keep going until stopAlarm(). */
  startAlarm(label: string): Promise<void>;
  /** Stop the loud alarm. */
  stopAlarm(): Promise<void>;
}
