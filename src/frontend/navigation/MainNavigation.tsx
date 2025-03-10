import React from "react";
import NavBar from "../components/common/NavBar";
import { useAuth } from "../context/AuthContext";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./screens/auth/LoginScreen";
import SignUpScreen from "./screens/auth/SignUpScreen";
import PhoneNumberScreen from "./screens/auth/accountCreation/PhoneNumberScreen";

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  PhoneNumber: undefined;
  OTP: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

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
        <>
          <Stack.Screen
            name="Home"
            component={NavBar} // Use NavBar here as the main screen
            options={{ headerShown: false }} // No header needed, since NavBar is the main navigation
          />
          {/* <Stack.Screen
            name="PhoneNumber"
            component={PhoneNumberScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }} // You can add your header config if needed
          /> 
           <Stack.Screen
            name="OTP"
            component={OTPScreen}
            options={{ headerShown: false }} // You can add your header config if needed
          /> 
          */}
        </>
      )}
    </Stack.Navigator>
  );
}
