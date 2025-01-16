import React, { useState } from "react";
import { View, Image, TextInput } from "react-native";
import { ThemedText } from "./ThemedText";
interface Props {
  isPassword: boolean;
  tempText: string;
  className: string;
  onValueChange: (value: string) => void;
}

export default function TextEntry({
  isPassword,
  tempText,
  className,
  onValueChange,
}: Props) {
  const [value, setValue] = useState<string>(tempText);

  return (
    <View className="w-full">
        <ThemedText></ThemedText>
      {!isPassword && (
        <TextInput
          className={
            { className } + " email border rounded w-full h-[40px] px-2"
          }
          returnKeyType="next"
          value={value}
          onChangeText={(text) => setValue(text)}
          autoCapitalize="none"
          textContentType="emailAddress"
          keyboardType="email-address"
        />
      )}
      {isPassword && (
        <TextInput
          className={
            { className } + " email border rounded w-full h-[40px] px-2"
          }
          returnKeyType="next"
          value={value}
          onChangeText={(text) => setValue(text)}
          autoCapitalize="none"
          textContentType="password"
          secureTextEntry
        />
      )}
    </View>
  );
}
