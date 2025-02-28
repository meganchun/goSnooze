import React, { useEffect, useState } from "react";
import { ScrollView, View, ViewProps } from "react-native";
import { ThemedView } from "../../components/ThemedView";
import { ThemedText } from "../../components/ThemedText";
import { getAlerts } from "../../services/transitService";
import { Alert } from "../../types/transitTypes";
import AlertMessage from "../../components/alerts/AlertMessage";
import { useThemeColour } from "../../hooks/useThemeColour";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export default function AlertsScreen({
  lightColor,
  darkColor,
}: ThemedViewProps) {
  const secondary = useThemeColour(
    { light: lightColor, dark: darkColor },
    "description"
  );
  const [alerts, setAlerts] = useState<Alert[] | null>(null);
  // Fetch alerts
  useEffect(() => {
    const fetchLines = async () => {
      try {
        const fetchedAlerts = await getAlerts();
        setAlerts(
          fetchedAlerts.Messages.Message.map((alert: any) => {
            return {
              title: alert.SubjectEnglish,
              message: alert.BodyEnglish,
              category: alert.Category,
              date: alert.PostedDateTime,
            };
          })
        );
      } catch (error) {
        console.error("Error fetching alerts:", error);
      }
    };
    fetchLines();
  }, []);

  return (
    <ScrollView>
      <ThemedView className="flex-1">
        <ThemedText type="title" className="font-bold mx-6 py-4">
          Alerts
        </ThemedText>
        <ScrollView className="overflow-hidden mx-10 my-4 flex-1 relative">
          {alerts &&
            alerts.map((alert) => (
              <View className="flex flex-col mb-8 gap-6">
                <AlertMessage alert={alert} />
                <View className={`flex h-0 w-full border-[0.5px]`} />
              </View>
            ))}
        </ScrollView>
      </ThemedView>
    </ScrollView>
  );
}
