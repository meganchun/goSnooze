import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Switch,
  TouchableOpacity,
  View,
  ViewProps,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import ChevronLeftIcon from "react-native-vector-icons/FontAwesome6";
import { ThemedView } from "../../../../components/common/ThemedView";
import { ThemedText } from "../../../../components/common/ThemedText";
import { useThemeColour } from "../../../../hooks/useThemeColour";
import { Colours } from "../../../../constants/Colours";
import { useAuth } from "../../../../context/AuthContext";
import {
  AlertPreferences,
  cacheAlertPreferences,
  getCachedAlertPreferences,
} from "../../../../services/notificationService";
import {
  getAlertPreferences,
  saveAlertPreferences,
} from "../../../../services/alertPreferencesService";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

// Radius presets. One decimal place to match the DB column numeric(3,1).
const RADIUS_OPTIONS: { label: string; value: number }[] = [
  { label: "200 m", value: 0.2 },
  { label: "500 m", value: 0.5 },
  { label: "1 km", value: 1.0 },
  { label: "2 km", value: 2.0 },
];

export default function NotificationsScreen({
  lightColor,
  darkColor,
}: ThemedViewProps) {
  const navigation = useNavigation();
  const { user } = useAuth();

  const textColour = useThemeColour(
    { light: lightColor, dark: darkColor },
    "text"
  );

  const [prefs, setPrefs] = useState<AlertPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved preferences (Supabase if signed in, otherwise the on-device cache).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const loaded = user?.id ? await getAlertPreferences(user.id) : null;
        const resolved = loaded ?? (await getCachedAlertPreferences());
        if (!cancelled) setPrefs(resolved);
      } catch (e: any) {
        // Fall back to whatever we have cached so the screen is still usable.
        const cached = await getCachedAlertPreferences();
        if (!cancelled) {
          setPrefs(cached);
          setError("Couldn't load your saved settings. Showing defaults.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  // Optimistically apply a change, then persist it.
  const update = async (patch: Partial<AlertPreferences>) => {
    if (!prefs) return;
    const next = { ...prefs, ...patch };
    setPrefs(next);
    setSaving(true);
    setError(null);
    try {
      if (user?.id) {
        await saveAlertPreferences(user.id, next);
      } else {
        await cacheAlertPreferences(next);
      }
    } catch (e: any) {
      setError("Couldn't save. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  const switchTrack = { false: "#D9D9D9", true: Colours.constant.approved };

  return (
    <ThemedView className="flex-1">
      <View className="header flex mx-8 my-10 gap-8">
        <ChevronLeftIcon
          name="chevron-left"
          size={24}
          color={textColour}
          onPress={navigation.goBack}
        />
        <ThemedText type="title" className="font-bold">
          Notifications
        </ThemedText>
      </View>

      {loading || !prefs ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={Colours.light.iconSelected} />
        </View>
      ) : (
        <View className="mx-8 gap-8">
          {/* Buzz */}
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-4">
              <ThemedText type="defaultBold">Vibrate</ThemedText>
              <ThemedText type="description">
                Buzz your phone when you're approaching your stop.
              </ThemedText>
            </View>
            <Switch
              value={prefs.buzzEnabled}
              onValueChange={(v) => update({ buzzEnabled: v })}
              trackColor={switchTrack}
            />
          </View>

          {/* Sound */}
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-4">
              <ThemedText type="defaultBold">Sound</ThemedText>
              <ThemedText type="description">
                Play a sound with the arrival notification.
              </ThemedText>
            </View>
            <Switch
              value={prefs.soundEnabled}
              onValueChange={(v) => update({ soundEnabled: v })}
              trackColor={switchTrack}
            />
          </View>

          {/* Radius */}
          <View className="gap-3">
            <ThemedText type="defaultBold">Wake-up distance</ThemedText>
            <ThemedText type="description">
              How far from your stop we alert you.
            </ThemedText>
            <View className="flex-row gap-2 mt-1">
              {RADIUS_OPTIONS.map((option) => {
                const selected = prefs.radiusKm === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => update({ radiusKm: option.value })}
                    className="flex-1 items-center rounded-lg py-3"
                    style={{
                      backgroundColor: selected
                        ? Colours.light.iconSelected
                        : "transparent",
                      borderWidth: 1,
                      borderColor: selected
                        ? Colours.light.iconSelected
                        : "#D9D9D9",
                    }}
                  >
                    <ThemedText
                      style={{ color: selected ? "#FFFFFF" : textColour }}
                    >
                      {option.label}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {saving && (
            <ThemedText type="description">Saving…</ThemedText>
          )}
          {error && (
            <ThemedText
              type="description"
              style={{ color: Colours.constant.danger }}
            >
              {error}
            </ThemedText>
          )}
        </View>
      )}
    </ThemedView>
  );
}
