import {
  Text,
  type TextProps,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useThemeColour } from "../../hooks/useThemeColour";
import { useFonts } from "expo-font";
import {
  DMSans_400Regular,
  DMSans_700Bold,
  DMSans_500Medium,
} from "@expo-google-fonts/dm-sans";
import Icon from "react-native-vector-icons/Ionicons";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type: "primary" | "outlined" | "disabled";
  className?: string;
  bold?: boolean;
  icon?: string;
  size?: "small" | "regular";
  onPress: () => void;
};

export function ThemedButton({
  style,
  lightColor,
  darkColor,
  type,
  className,
  children,
  bold,
  icon,
  size = "regular",
  onPress,
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
    <TouchableOpacity
      className={className}
      style={[
        {
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
          padding: size === "regular" ? 8 : 4,
          paddingHorizontal: size === "regular" ? 16 : 12,
          borderRadius: 4,
          justifyContent: "center",
          borderWidth: type === "outlined" ? 1 : undefined,
        },
        type === "primary" ? styles.default : undefined,
        type === "outlined" ? styles.outlined : undefined,
        type === "disabled" ? styles.disabled : undefined,
        style,
      ]}
      onPress={onPress}
    >
      {icon && (
        <Icon
          name={icon}
          size={size === "regular" ? 16 : 12}
          style={[
            type === "primary" ? styles.default : undefined,
            type === "outlined" ? styles.outlined : undefined,
            type === "disabled" ? styles.disabled : undefined,
          ]}
        />
      )}
      <Text
        style={[
          {
            fontSize: size === "regular" ? 16 : 12,
            lineHeight: 24,
            fontFamily: bold ? "DMSans_700Bold" : "DMSans_400Regular",
            textAlign: "center",
          },
          type === "primary" ? styles.default : undefined,
          type === "outlined" ? styles.outlined : undefined,
          type === "disabled" ? styles.disabled : undefined,
        ]}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  default: {
    color: "#FFFF",
    backgroundColor: "#0057FF",
  },
  outlined: {
    color: "#0057FF",
    backgroundColor: "#FFFF",
    borderColor: "#0057FF",
  },
  disabled: {
    color: "#FFFF",
    backgroundColor: "#D9D9D9",
  },
});
