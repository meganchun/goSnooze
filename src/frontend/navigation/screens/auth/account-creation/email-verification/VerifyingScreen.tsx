import React, { useEffect } from "react";
import { ThemedText } from "@/src/frontend/components/common/ThemedText";
import { ThemedView } from "@/src/frontend/components/common/ThemedView";
import ChevronLeftIcon from "react-native-vector-icons/FontAwesome6";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/src/frontend/navigation/MainNavigation";
import { Text } from "react-native";
import { useAuth } from "@/src/frontend/context/AuthContext";
import { ThemedButton } from "@/src/frontend/components/common/ThemedButton";
import { View } from "react-native";

type VerifyEmailScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "VerifyingEmail"
>;

export default function VerifyingScreen() {
  const navigation = useNavigation<VerifyEmailScreenNavigationProp>();
  const { userEmail, sendEmail, verifyEmailVerification } = useAuth();

  useEffect(() => {
    const interval = setInterval(async () => {
      verifyEmailVerification(interval);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <ThemedView className="flex-1">
      <View className="header flex mx-8 my-10 gap-16">
        <ChevronLeftIcon
          name="chevron-left"
          size={24}
          onPress={navigation.goBack}
        />
        <View className="flex gap-8">
          {" "}
          <ThemedText className="px-30" type="title">
            <Text style={{ color: "#0057FF" }}>Verify </Text>
            your email.
          </ThemedText>
          <ThemedText type="default">
            We've sent an email to{" "}
            <ThemedText type="defaultBold">{userEmail}</ThemedText>. Follow the
            steps in the email before continuing!
          </ThemedText>
          <ThemedButton type="primary" bold onPress={() => sendEmail()}>
            Resend
          </ThemedButton>
        </View>
      </View>
    </ThemedView>
  );
}
