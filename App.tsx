import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  ThemeProvider,
} from "@react-navigation/native";
import "@/global.css";
import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { StatusBar } from "expo-status-bar";
import "./global.css";
import { useColourScheme } from "./src/frontend/hooks/useColourScheme.web";
import { LocationProvider } from "./src/frontend/context/LocationContext";
import { AuthProvider } from "./src/frontend/context/AuthContext";
import MainNavigation from "./src/frontend/navigation/MainNavigation";
import { handleNotificationResponse } from "./src/frontend/services/alarm/escalationService";

export default function App() {
  const colorScheme = useColourScheme();

  // Dismiss the alarm when the rider taps the notification or its "I'm awake"
  // action (works from the lock screen, for the notification-fallback path).
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(
      handleNotificationResponse
    );
    return () => sub.remove();
  }, []);

  return (
    <NavigationContainer>
      <AuthProvider>
        <LocationProvider>
          <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
          >
            <MainNavigation />
            <StatusBar style="auto" />
          </ThemeProvider>
        </LocationProvider>
      </AuthProvider>
    </NavigationContainer>
  );
}

