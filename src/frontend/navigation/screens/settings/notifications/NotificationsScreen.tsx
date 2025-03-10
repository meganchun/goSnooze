import React from "react";
import { View, Image, TouchableOpacity, ViewProps, Text } from "react-native";
import { ThemedView } from "../../../../components/common/ThemedView";
import { ThemedText } from "../../../../components/common/ThemedText";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useThemeColour } from "../../../../hooks/useThemeColour";
export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export default function NotificationsScreen({
  style,
  lightColor,
  darkColor,
  ...otherProps
}: ThemedViewProps) {
  const textColour = useThemeColour(
    { light: lightColor, dark: darkColor },
    "text"
  );

  return <ThemedView className="flex-1"></ThemedView>;
}
