import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import "@/global.css";
import { StatusBar } from "expo-status-bar";
import "./global.css";
import NavBar from "./src/frontend/components/NavBar";
import { useColourScheme } from "./src/frontend/hooks/useColourScheme.web";
import { LocationProvider } from "./src/frontend/context/LocationContext";

export default function App() {
  const colorScheme = useColourScheme();

  return (
    <LocationProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <NavBar />
        <StatusBar style="auto" />
      </ThemeProvider>
    </LocationProvider>
  );
}
