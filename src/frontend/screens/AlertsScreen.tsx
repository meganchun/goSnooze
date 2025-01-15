import React from "react";
import { View } from "react-native";
import { ThemedView } from "../components/ThemedView";
import { ThemedText } from "../components/ThemedText";
import MapView from "react-native-maps";

export default function AlertsScreen() {
  return (
    <ThemedView className="flex-1">
      <ThemedText type="title" className="font-bold mx-6 py-4">
        Alerts
      </ThemedText>
      <View className="overflow-hidden rounded-2xl my-4 flex-1 relative">
      </View>
    </ThemedView>
  );
}
