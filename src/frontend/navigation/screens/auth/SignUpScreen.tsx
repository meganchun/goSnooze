import React, { useState } from "react";
import {
  View,
  Image,
  TextInput,
  Button,
  TouchableOpacity,
  Text,
} from "react-native";
import { ThemedView } from "../../../components/common/ThemedView";
import { ThemedText } from "../../../components/common/ThemedText";
import TextEntry from "@/src/frontend/components/common/TextEntry";
import { ThemedButton } from "@/src/frontend/components/common/ThemedButton";

export default function SignUpScreen() {
  const [email, setEmail] = useState<string | undefined>();
  const [password, setPassword] = useState<string | undefined>();

  const handleForgotPassword = () => {};
  const handleContinue = () => {};
  const handleSignInGoogle = () => {};
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
            />
            <TouchableOpacity
              className="items-end"
              onPress={handleForgotPassword}
            >
              <ThemedText type="link">Forgot Password?</ThemedText>
            </TouchableOpacity>
          </View>
          <ThemedButton type="primary" bold onPress={handleContinue}>
            Continue
          </ThemedButton>
          <View className="flex flex-row items-center gap-2">
            <View className="flex flex-1 h-0 border-[0.5px] border-[#D9D9D9]" />
            <ThemedText style={{ color: "#D9D9D9" }}>Or</ThemedText>
            <View className="flex flex-1 h-0 border-[0.5px] border-[#D9D9D9]" />
          </View>
          <ThemedButton type="outlined" bold onPress={handleSignInGoogle}>
            Continue with Google
          </ThemedButton>
        </View>
      </View>
    </ThemedView>
  );
}
