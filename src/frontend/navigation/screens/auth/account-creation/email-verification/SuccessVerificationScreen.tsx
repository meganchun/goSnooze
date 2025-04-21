import React from "react";
import { ThemedText } from "@/src/frontend/components/common/ThemedText";
import { ThemedView } from "@/src/frontend/components/common/ThemedView";
import ChevronLeftIcon from "react-native-vector-icons/FontAwesome6";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/src/frontend/navigation/MainNavigation";
import { Text, View } from "react-native";
import { useAuth } from "@/src/frontend/context/AuthContext";
import { ThemedButton } from "@/src/frontend/components/common/ThemedButton";

type SuccessVerificationScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "SuccessEmail"
>;

export default function SuccessVerificationScreen() {
  const navigation = useNavigation<SuccessVerificationScreenNavigationProp>();
  const { userEmail } = useAuth();

  return (
    <ThemedView className="flex-1">
      <View className="header flex mx-8 my-10 gap-16">
        <ChevronLeftIcon
          name="chevron-left"
          size={24}
          onPress={navigation.goBack}
        />
        <View className="flex gap-8">
          <ThemedText className="px-30" type="title">
            Account <Text style={{ color: "#0057FF" }}>verified!</Text>
          </ThemedText>

          <ThemedText type="default">
            Congratulations! Your email account{" "}
            <ThemedText type="defaultBold">{userEmail}</ThemedText> has been
            verified! You're ready to go snooze.
          </ThemedText>
          <ThemedButton
            type="primary"
            bold
            onPress={() => navigation.navigate("Main")}
          >
            Continue to your account.
          </ThemedButton>
        </View>
      </View>
    </ThemedView>
  );
}
