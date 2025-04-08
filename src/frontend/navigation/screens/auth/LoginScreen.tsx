import React, { useEffect, useState } from "react";
import { View, Image, TouchableOpacity, Text } from "react-native";
import { ThemedView } from "../../../components/common/ThemedView";
import { ThemedText } from "../../../components/common/ThemedText";
import TextEntry from "@/src/frontend/components/common/TextEntry";
import { ThemedButton } from "@/src/frontend/components/common/ThemedButton";

import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import {
  auth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
} from "@/src/backend/firebase";
import { useAuth } from "@/src/frontend/context/AuthContext";
import { User } from "@/src/frontend/types/userTypes";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../MainNavigation";

WebBrowser.maybeCompleteAuthSession();
type NavigationProp = StackNavigationProp<RootStackParamList, "Login">;

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();

  const [email, setEmail] = useState<string | undefined>();
  const [password, setPassword] = useState<string | undefined>();
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId:
      "614855422365-25jf4e0j0di95edkcslenrd6hm8baptf.apps.googleusercontent.com",
    scopes: ["profile", "email"],
  });
  const { login, checkAuth } = useAuth();
  const [error, setError] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const handleForgotPassword = () => {
    navigation.navigate("PhoneNumber");
  };

  const handleLogin = async () => {
    try {
      if (!email || !password) return;
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const token = await userCredential.user.getIdToken();
      const userData: User = {
        email: userCredential.user.email || "",
        firstName: "",
        lastName: "",
        phone: userCredential.user.phoneNumber || "",
      };
      await login(userData, token);
    } catch (error: any) {
      setError(true);
      console.log("Login failed:", error.message);
    }
  };

  const handleGoogleLogin = async () => {
    const result = await promptAsync();
    if (result?.type === "success") {
      const idToken = result.authentication?.idToken;
      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      console.log("Google user:", userCredential.user);
    }
  };

  return (
    <ThemedView className="flex-1 justify-end">
      <View className="items-start p-10 flex gap-8 ">
        <View className="items-start gap-8 ">
          <Image
            source={require("../../../../../assets/snoozeLogo-white.png")}
            className="size-20 p-4 bg-[#0057FF] rounded-full"
          />
          <ThemedText type="title" className="">
            <Text style={{ color: "#0057FF" }}>Sign in</Text> to your Account
          </ThemedText>
        </View>

        <View className="w-full gap-5">
          <View className="username-container flex flex-col w-full gap-2">
            <ThemedText type="defaultBold" style={{ color: "#757575" }}>
              Username
            </ThemedText>
            <TextEntry
              className="email-text w-full"
              value={email}
              setValue={setEmail}
              placeholder="example@gmail.com"
              keyboardType="email-address"
              textContentType="emailAddress"
              warning={error ? "Invalid Email or Password" : undefined}
            />
          </View>
          <View className="password-container flex flex-col w-full gap-2">
            <ThemedText type="defaultBold" style={{ color: "#757575" }}>
              Password
            </ThemedText>
            <TextEntry
              className="password-text w-full"
              value={password}
              placeholder=""
              setValue={setPassword}
              textContentType="password"
              keyboardType="visible-password"
              warning={error ? "Invalid Email or Password" : undefined}
            />
            <TouchableOpacity
              className="items-end"
              onPress={handleForgotPassword}
            >
              <ThemedText type="link">Forgot Password?</ThemedText>
            </TouchableOpacity>
          </View>
          <ThemedButton type="primary" bold onPress={handleLogin}>
            Continue
          </ThemedButton>
          <View className="flex flex-row items-center gap-2">
            <View className="flex flex-1 h-0 border-[0.5px] border-[#D9D9D9]" />
            <ThemedText style={{ color: "#D9D9D9" }}>Or</ThemedText>
            <View className="flex flex-1 h-0 border-[0.5px] border-[#D9D9D9]" />
          </View>
          <ThemedButton
            icon="logo-google"
            type="outlined"
            bold
            onPress={() => handleGoogleLogin()}
          >
            Continue with Google
          </ThemedButton>
        </View>
      </View>
    </ThemedView>
  );
}
