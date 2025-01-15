import { View, type ViewProps } from "react-native";

import { useThemeColour } from "../hooks/useThemeColour";
import { SafeAreaView } from "react-native";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  className?: string;
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  className,
  ...otherProps
}: ThemedViewProps) {
  const backgroundColor = useThemeColour(
    { light: lightColor, dark: darkColor },
    "background"
  );

  return (
    <SafeAreaView
      style={[{ backgroundColor }, style]}
      className={className}
      {...otherProps}
    />
  );
}
