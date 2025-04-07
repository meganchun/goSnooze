import { ThemedText } from "@/src/frontend/components/common/ThemedText";
import { ThemedView } from "@/src/frontend/components/common/ThemedView";
import { Text, View } from "react-native";
import ChevronLeftIcon from "react-native-vector-icons/FontAwesome6";
import PhoneInput from "react-native-phone-number-input";
import { useEffect, useRef, useState } from "react";
import { ThemedButton } from "@/src/frontend/components/common/ThemedButton";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../../MainNavigation";
import TextEntry from "@/src/frontend/components/common/TextEntry";
import { useAuth } from "@/src/frontend/context/AuthContext";
import { Colours } from "@/src/frontend/constants/Colours";

type OTPScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "OTP",
  "ProfileDetails"
>;

export default function OTPScreen() {
  const navigation = useNavigation<OTPScreenNavigationProp>();

  const { verifyOTP, isOTPVerified, OTP, setOTP, error } = useAuth();

  const [value, setValue] = useState("");
  const [valid, setValid] = useState(false);
  const phoneInput = useRef<PhoneInput>(null);

  useEffect(() => {
    if (isOTPVerified) {
      navigation.navigate("ProfileDetails");
    }
  }, [isOTPVerified]);

  const handleVerifyOTP = async () => {
    try {
      await verifyOTP();
    } catch (error: any) {
      console.log("Error");
    }
  };

  return (
    <ThemedView className="flex-1">
      <View className="header flex mx-8 my-10 gap-16">
        <ChevronLeftIcon name="chevron-left" size={24} />
        <ThemedText className="px-30" type="title">
          Psstt...we’ve sent {"\n"}you a{" "}
          <Text style={{ color: "#0057FF" }}>super secret</Text> code
        </ThemedText>
      </View>
      <View className="header flex mx-8 my-10 gap-8 justify-center">
        <ThemedText
          type="description"
          style={{
            color: Colours.constant.danger,
          }}
        >
          {error}
        </ThemedText>
        <View className="flex flex-row justify-between">
          {[...Array(6)].map((_, index) => (
            <TextEntry
              key={index}
              value={OTP[index]}
              setValue={(value) => {
                const newOTP = OTP.split("");
                newOTP[index] = value || "";
                setOTP(newOTP.join(""));
              }}
              textContentType="oneTimeCode"
              keyboardType="numeric"
              maxLength={1}
            />
          ))}
        </View>

        <ThemedButton type="primary" bold onPress={() => handleVerifyOTP()}>
          Next
        </ThemedButton>
      </View>
    </ThemedView>
  );
}
