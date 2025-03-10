import React from "react";
import NavBar from "../components/common/NavBar";
import { useAuth } from "../context/AuthContext";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./screens/auth/LoginScreen";
import SignUpScreen from "./screens/auth/SignUpScreen";

const Stack = createStackNavigator();

export default function MainNavigation() {
  const { isAuthenticated } = useAuth();

  return (
    <Stack.Navigator>
      {isAuthenticated ? (
        <Stack.Screen
          name="Home"
          component={NavBar} // Use NavBar here as the main screen
          options={{ headerShown: false }} // No header needed, since NavBar is the main navigation
        />
      ) : (
        //   <Stack.Screen name="Login" component={LoginScreen} />
        <>
          <Stack.Screen
            name="Home"
            component={NavBar} // Use NavBar here as the main screen
            options={{ headerShown: false }} // No header needed, since NavBar is the main navigation
          />
          {/* <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }} // You can add your header config if needed
          />
          <Stack.Screen
            name="SignUp"
            component={SignUpScreen}
            options={{ headerShown: false }}
          /> */}
        </>
      )}
    </Stack.Navigator>
  );
}
