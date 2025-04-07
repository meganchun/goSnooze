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
import { auth, signInWithPhoneNumber } from "@/src/backend/firebase";
import { useAuth } from "@/src/frontend/context/AuthContext";

type PhoneNumberScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "PhoneNumber"
>;

export default function PhoneNumberScreen() {
  const navigation = useNavigation<PhoneNumberScreenNavigationProp>();

  const { sendOTP } = useAuth();

  const [value, setValue] = useState("");
  const [formattedValue, setFormattedValue] = useState("");
  const [valid, setValid] = useState(false);
  const phoneInput = useRef<PhoneInput>(null);

  useEffect(() => {
    const handleSendOTP = async () => {
      if (valid) {
        await sendOTP(value);
        navigation.navigate("OTP");
      }
    };
    handleSendOTP();
  }, [valid]);

  return (
    <ThemedView className="flex-1">
      <View className="header flex mx-8 my-10 gap-16">
        <ChevronLeftIcon name="chevron-left" size={24} />
        <ThemedText className="px-30" type="title">
          To start, we're going to need your{" "}
          <Text style={{ color: "#0057FF" }}>number</Text>
        </ThemedText>
      </View>
      <View className="header flex mx-8 my-10 gap-8 justify-center">
        <PhoneInput
          ref={phoneInput}
          defaultValue={value}
          defaultCode="CA"
          layout="first"
          onChangeText={(text) => {
            setValue(text);
          }}
          onChangeFormattedText={(text) => {
            setFormattedValue(text);
          }}
          withDarkTheme
          autoFocus
          textInputStyle={{
            fontFamily: "DMSans_500Medium",
          }}
        />
        <ThemedButton
          type="primary"
          bold
          onPress={() => {
            const checkValid = phoneInput.current?.isValidNumber(value);
            setValid(checkValid ? checkValid : false);
          }}
        >
          Next
        </ThemedButton>
      </View>
    </ThemedView>
  );
}
