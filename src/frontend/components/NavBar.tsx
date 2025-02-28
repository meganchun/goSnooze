import React from "react";
import { type ViewProps } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/home/HomeScreen";
import SettingsScreen from "../screens/settings/SettingsScreen";
import AlertsScreen from "../screens/AlertsScreen";
import { useThemeColour } from "../hooks/useThemeColour";
import Icon from "react-native-vector-icons/MaterialIcons";
import SignUpScreen from "../screens/auth/SignUpScreen";

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
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === "Home") {
              return <Icon name="home" size={26} color={color} />;
            } else if (route.name === "Alerts") {
              return <Icon name="notifications" size={26} color={color} />;
            } else if (route.name === "Alerts") {
              return <Icon name="notifications" size={26} color={color} />;
            } else return <Icon name="settings" size={26} color={color} />;
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
        <Tab.Screen name="Sign Up" component={SignUpScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
