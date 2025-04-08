import { ThemedText } from "@/src/frontend/components/common/ThemedText";
import { ThemedView } from "@/src/frontend/components/common/ThemedView";
import { Text, View } from "react-native";
import ChevronLeftIcon from "react-native-vector-icons/FontAwesome6";
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

  const { verifyOTP, OTP, setOTP, error } = useAuth();

  const handleVerifyOTP = async () => {
    try {
      await verifyOTP();
    } catch (error: any) {
      console.log("Error");
    }
  };

  return (
    <ThemedView className="flex-1 w-full">
      <View className="header flex mx-8 my-10 gap-16">
        <ChevronLeftIcon
          name="chevron-left"
          size={24}
          onPress={navigation.goBack}
        />
        <ThemedText className="px-30" type="title">
          Psstt...we’ve sent {"\n"}you a{" "}
          <Text style={{ color: "#0057FF" }}>super secret</Text> code
        </ThemedText>
      </View>
      <View className="header flex flex-col mx-8 my-10 gap-5 justify-center w-fit">
        <View className="flex flex-row w-full justify-between">
          {[...Array(6)].map((_, index) => (
            <TextEntry
              key={index}
              value={OTP[index] || ""}
              setValue={(value) => {
                const newOTP = OTP.split("");
                newOTP[index] = value || "";
                setOTP(newOTP.join(""));
              }}
              textContentType="oneTimeCode"
              keyboardType="numeric"
              className="max-w-[40px]"
              maxLength={1}
              warning={error ? " " : undefined}
            />
          ))}
        </View>
        <ThemedText
          type="description"
          style={{
            color: Colours.constant.danger,
          }}
        >
          {error}
        </ThemedText>
        <ThemedButton type="primary" bold onPress={() => handleVerifyOTP()}>
          Next
        </ThemedButton>
      </View>
    </ThemedView>
  );
}
