import React from "react";
import { Alert } from "../../types/transitTypes";
import { View, ViewProps } from "react-native";
import { ThemedText } from "../common/ThemedText";
import Icon from "react-native-vector-icons/Ionicons";
import IconChevron from "react-native-vector-icons/Octicons";
import { useThemeColour } from "../../hooks/useThemeColour";

export type ThemedViewProps = ViewProps & {
  alert: Alert;
  lightColor?: string;
  darkColor?: string;
};
export default function AlertMessage({
  alert,
  lightColor,
  darkColor,
}: ThemedViewProps) {
  const iconColor = useThemeColour(
    { light: lightColor, dark: darkColor },
    "iconSelected"
  );
  return (
    <View className="flex flex-wrap w-full gap-2">
      <View className="flex flex-row gap-5 justify-between items-start w-full">
        <View className="flex flex-row gap-2 flex-shrink">
          <View
            className={`bg-[${iconColor}] w-auto aspect-square p-2 rounded-sm`}
          >
            <Icon
              name={
                alert.category === "Amenity"
                  ? "business"
                  : alert.category === "Service Disruption"
                  ? "business"
                  : "information-circle-sharp"
              }
              size={16}
              color="white"
            />
          </View>
          <ThemedText type="defaultBold">{alert.title}</ThemedText>
        </View>
        <ThemedText type="description" className="flex-shrink text-right">
          {alert.date}
        </ThemedText>
      </View>
      <View className="flex flex-row w-full justify-between max-h-16 overflow-ellipsis">
        <ThemedText type="description" className="flex flex-wrap w-[90%]">
          {alert.message}
        </ThemedText>
        <IconChevron name="chevron-down" />
      </View>
    </View>
  );
}
