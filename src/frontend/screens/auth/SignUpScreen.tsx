import React, { useState } from "react";
import { View, Image, TextInput } from "react-native";
import { ThemedView } from "../../components/ThemedView";
import { ThemedText } from "../../components/ThemedText";
import TextEntry from "../../components/TextEntry";

export default function SignUpScreen() {
  const [email, setEmail] = useState<string>();
  const [password, setPassword] = useState<string>();

  return (
    <ThemedView className="flex-1">
      <View className="items-center px-10">
        <Image
          source={require("../../../../assets/snoozeLogo.png")}
          className="mr-4 size-16"
        />
        <ThemedText type="subtitle" className="">
          Sign in to your Account
        </ThemedText>
        <TextEntry
          isPassword={false}
          tempText="example@gmail.com"
          className="email"
          onValueChange={(value) => setEmail(value)}
        />
        <TextEntry
          isPassword={true}
          tempText=""
          className="password"
          onValueChange={(value) => setEmail(value)}
        />
      </View>
    </ThemedView>
  );
}
