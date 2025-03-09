import React, { useState } from "react";
import { TouchableOpacity, View, ViewProps } from "react-native";
import { useThemeColour } from "../../hooks/useThemeColour";
import Icon from "react-native-vector-icons/Ionicons";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  mode: "train" | "bus";
  setMode: (mode: "train" | "bus") => void;
};

export default function ToggleSwitch({
  lightColor,
  darkColor,
  mode,
  setMode,
  className,
  ...otherProps
}: ThemedViewProps) {
  const secondary = useThemeColour(
    { light: lightColor, dark: darkColor },
    "background"
  );

  const selected = useThemeColour(
    { light: lightColor, dark: darkColor },
    "iconSelected"
  );
  const unselected = useThemeColour(
    { light: lightColor, dark: darkColor },
    "tabIconDefault"
  );
  return (
    <View className={`${className} toggle-container flex flex-row gap-1`}>
      <TouchableOpacity activeOpacity={1} onPress={() => setMode("train")}>
        <Icon
          name="train"
          size={18}
          color={secondary}
          style={{
            backgroundColor: mode === "train" ? selected : undefined,
            color: mode === "train" ? secondary : unselected,
          }}
          className="flex justify-center self-center py-1 px-3 rounded bg-opacity-50"
        />
      </TouchableOpacity>

      <TouchableOpacity activeOpacity={1} onPress={() => setMode("bus")}>
        <Icon
          name="bus"
          size={18}
          style={{
            backgroundColor: mode === "bus" ? selected : undefined,
            color: mode === "bus" ? secondary : unselected,
          }}
          className="flex justify-center self-center py-1 px-3 rounded"
        />
      </TouchableOpacity>
    </View>
  );
}
