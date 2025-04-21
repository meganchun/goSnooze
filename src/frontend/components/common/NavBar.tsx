import React from "react";
import { type ViewProps } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../../navigation/screens/home/HomeScreen";
import SettingsScreen from "../../navigation/screens/settings/SettingsScreen";
import AlertsScreen from "../../navigation/screens/alerts/AlertsScreen";
import { useThemeColour } from "../../hooks/useThemeColour";
import SettingIcon from "react-native-vector-icons/MaterialIcons";
import HouseIcon from "react-native-vector-icons/FontAwesome6";
import BellIcon from "react-native-vector-icons/Ionicons";
import PhoneNumberScreen from "../../navigation/screens/auth/account-creation/PhoneNumberScreen";
import OTPScreen from "../../navigation/screens/auth/account-creation/OTPScreen";
import ProfileDetailsScreen from "../../navigation/screens/auth/account-creation/ProfileDetailsScreen";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

const Tab = createBottomTabNavigator();

export default function NavBar({
  lightColor,
  darkColor,
  ...otherProps
}: ThemedViewProps) {
  const selectedIconColour = useThemeColour(
    { light: lightColor, dark: darkColor },
    "iconSelected"
  );
  const unselectedIconColour = useThemeColour(
    { light: lightColor, dark: darkColor },
    "tabIconDefault"
  );
  const backgroundColour = useThemeColour(
    { light: lightColor, dark: darkColor },
    "tint"
  );

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === "Home") {
            return <HouseIcon name="house" size={20} color={color} />;
          } else if (route.name === "Alerts") {
            return <BellIcon name="notifications" size={24} color={color} />;
          } else return <SettingIcon name="settings" size={26} color={color} />;
        },
        tabBarActiveTintColor: selectedIconColour,
        tabBarInactiveTintColor: unselectedIconColour,
        tabBarStyle: {
          height: 80,
          paddingTop: 10,
          paddingHorizontal: 20,
          backgroundColor: backgroundColour,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Alerts" component={AlertsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
      {/* <Tab.Screen name="test" component={ProfileDetailsScreen} /> */}
    </Tab.Navigator>
  );
}
