import React from "react";
import NavBar from "../components/common/NavBar";
import { useAuth } from "../context/AuthContext";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./screens/auth/LoginScreen";
import SignUpScreen from "./screens/auth/SignUpScreen";
import PhoneNumberScreen from "./screens/auth/accountCreation/PhoneNumberScreen";
import ProfileDetailsScreen from "./screens/auth/accountCreation/ProfileDetailsScreen";
import OTPScreen from "./screens/auth/accountCreation/OTPScreen";

export type RootStackParamList = {
  Main: undefined;
  Login: undefined;
  PhoneNumber: undefined;
  OTP: undefined;
  ProfileDetails: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function MainNavigation() {
  const { isAuthenticated } = useAuth();

  return (
    <Stack.Navigator>
      {isAuthenticated ? (
        <Stack.Screen
          name="Main"
          component={NavBar}
          options={{ headerShown: false }}
        />
      ) : (
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ProfileDetails"
            component={ProfileDetailsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="OTP"
            component={OTPScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="PhoneNumber"
            component={PhoneNumberScreen}
            options={{ headerShown: false }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
