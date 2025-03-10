import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  ThemeProvider,
} from "@react-navigation/native";
import "@/global.css";
import { StatusBar } from "expo-status-bar";
import "./global.css";
import { useColourScheme } from "./src/frontend/hooks/useColourScheme.web";
import { LocationProvider } from "./src/frontend/context/LocationContext";
import { AuthProvider } from "./src/frontend/context/AuthContext";
import MainNavigation from "./src/frontend/navigation/MainNavigation";

export default function App() {
  const colorScheme = useColourScheme();

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

