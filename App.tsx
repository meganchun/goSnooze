import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import "./global.css";
import NavBar from "./src/frontend/components/NavBar";
import { useColourScheme } from "./src/frontend/hooks/useColourScheme.web";

export default function App() {
  const colorScheme = useColourScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <NavBar />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
