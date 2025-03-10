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

type OTPScreenNavigationProp = StackNavigationProp<RootStackParamList, "OTP">;

export default function OTPScreen() {
  const navigation = useNavigation<OTPScreenNavigationProp>();

  const [value, setValue] = useState("");
  const [valid, setValid] = useState(false);
  const phoneInput = useRef<PhoneInput>(null);

  const [code, setCode] = useState<(string | undefined)[]>([
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
  ]);

  useEffect(() => {
    if (valid) {
      navigation.navigate("Login");
    }
  }, [valid]);

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
        <View className="flex flex-row justify-between">
          {code.map((value, index) => (
            <TextEntry
              value={value}
              setValue={(value) => {
                const newCode = [...code];
                newCode[index] = value;
                setCode(newCode);
              }}
              textContentType="oneTimeCode"
              keyboardType="numeric"
              maxLength={1}
            />
          ))}
        </View>

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
