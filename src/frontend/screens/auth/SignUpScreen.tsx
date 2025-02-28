import React, { useState } from "react";
import { View, Image, TextInput, Button, TouchableOpacity } from "react-native";
import { ThemedView } from "../../components/ThemedView";
import { ThemedText } from "../../components/ThemedText";
import TextEntry from "../../components/TextEntry";

export default function SignUpScreen() {
  const [email, setEmail] = useState<string>();
  const [password, setPassword] = useState<string>();

  const handleForgotPassword = () => {};
  return (
    <ThemedView className="flex-1 justify-center">
      <View className="items-center px-10 flex gap-24">
        <View className="items-center gap-8 ">
          <Image
            source={require("../../../../assets/snoozeLogo.png")}
            className="mr-4 size-16"
          />
          <ThemedText type="subtitle" className="">
            Sign in to your Account
          </ThemedText>
        </View>

        <View className="w-full gap-5">
          <View className="username-container flex flex-col w-full">
            <ThemedText className="">Username</ThemedText>
            <TextEntry
              isPassword={false}
              tempText="example@gmail.com"
              className="email w-full"
              onValueChange={(value) => setEmail(value)}
            />
          </View>
          <View className="username-container w-full">
            <ThemedText>Password</ThemedText>
            <TextEntry
              isPassword={true}
              tempText=""
              className="password"
              onValueChange={(value) => setEmail(value)}
            />
            <TouchableOpacity
              className="items-end"
              onPress={handleForgotPassword}
            >
              <ThemedText>Forgot Password?</ThemedText>
            </TouchableOpacity>
          </View>
          <TouchableOpacity className="continue-button w-full flex items-center bg-[#0057FF] p-2 rounded-sm">
            <ThemedText className="text-white">Continue</ThemedText>
          </TouchableOpacity>
          <View className="flex flex-row items-center gap-2">
            <View className="flex flex-1 h-0 border-[0.5px]" />
            <ThemedText>Or</ThemedText>
            <View className="flex flex-1 h-0 border-[0.5px]" />
          </View>
          <TouchableOpacity className="continue-button w-full flex border-[1px] items-center p-2 rounded-sm">
            <ThemedText className="text-white">Continue with Google</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </ThemedView>
  );
}
