import { Text, type TextProps, StyleSheet } from "react-native";
import { useThemeColour } from "../hooks/useThemeColour";
import { useFonts } from "expo-font";
import {
  DMSans_400Regular,
  DMSans_700Bold,
  DMSans_500Medium,
} from "@expo-google-fonts/dm-sans";
export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?:
    | "default"
    | "defaultBold"
    | "description"
    | "title"
    | "subtitle"
    | "warning"
    | "link"
    | "description_light"
    | "subtitle_light";
  className?: string;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "default",
  className,
  ...rest
}: ThemedTextProps) {
  const color = useThemeColour({ light: lightColor, dark: lightColor }, "text");
  const lightTint = useThemeColour(
    { light: lightColor, dark: darkColor },
    "tint"
  );
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  return (
    <Text
      className={className}
      style={[
        { color },
        type === "default" ? styles.default : undefined,
        type === "defaultBold" ? styles.defaultBold : undefined,
        type === "description" ? styles.description : undefined,
        type === "title" ? styles.title : undefined,
        type === "subtitle" ? styles.subtitle : undefined,
        type === "warning" ? styles.warning : undefined,
        type === "link" ? styles.link : undefined,
        type === "description_light"
          ? [styles.description, { color: lightTint }]
          : undefined,
        type === "subtitle_light"
          ? [styles.subtitle, { color: lightTint }]
          : undefined,

        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: "DMSans_400Regular",
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "DMSans_400Regular",
    color: "#757575",
  },
  defaultBold: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: "DMSans_500Medium",
  },
  title: {
    fontSize: 32,
    lineHeight: 32,
    fontFamily: "DMSans_700Bold",
  },
  subtitle: {
    fontSize: 20,
    lineHeight: 24,
    fontFamily: "DMSans_700Bold",
  },
  warning: {
    lineHeight: 30,
    fontSize: 16,
    color: "#e83a3a",
    fontFamily: "DMSans_400Regular",
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: "#0057FF",
  },
});
