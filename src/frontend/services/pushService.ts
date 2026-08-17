import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { apiQuery } from "./apiManager";

// The EAS project id is required to mint an Expo push token in a dev/standalone
// build. It lands in app.json under extra.eas.projectId after `eas init`.
function getProjectId(): string | undefined {
  return (
    Constants.expoConfig?.extra?.eas?.projectId ??
    (Constants as unknown as { easConfig?: { projectId?: string } }).easConfig
      ?.projectId
  );
}

/**
 * Register this device for push and save its Expo push token to `push_tokens`
 * so a server (the send-push Edge Function) can reach the user later.
 *
 * No-ops safely on web, without notification permission, or before EAS is
 * configured. Returns the token, or null if it couldn't register.
 */
export async function registerPushToken(
  userId: string
): Promise<string | null> {
  if (Platform.OS === "web") return null;

  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") return null;

    const projectId = getProjectId();
    if (!projectId) {
      console.warn(
        "Skipping push registration: no EAS projectId yet (run `eas init`)."
      );
      return null;
    }

    const { data: token } = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    await apiQuery((c) =>
      c
        .from("push_tokens")
        .upsert(
          { user_id: userId, token, platform: Platform.OS },
          { onConflict: "user_id,token" }
        )
    );

    return token;
  } catch (e) {
    console.warn("Push token registration failed:", e);
    return null;
  }
}
