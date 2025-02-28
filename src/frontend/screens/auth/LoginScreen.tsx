import React from "react";
import { ThemedView } from "../../components/ThemedView";
import { View, ViewProps } from "react-native";
import { useThemeColour } from "../../hooks/useThemeColour";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export default function LoginScreen({
  lightColor,
  darkColor,
  ...otherProps
}: ThemedViewProps) {
  const themeColour = useThemeColour(
    { light: lightColor, dark: darkColor },
    "tint"
  );

  return (
    <ThemedView>
      <View className="blue-box bg-[#0057FF]"></View>
    </ThemedView>
  );
}
