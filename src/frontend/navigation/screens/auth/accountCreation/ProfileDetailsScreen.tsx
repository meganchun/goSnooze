import { ThemedText } from "@/src/frontend/components/common/ThemedText";
import { ThemedView } from "@/src/frontend/components/common/ThemedView";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import ChevronLeftIcon from "react-native-vector-icons/FontAwesome6";
import PhoneInput from "react-native-phone-number-input";
import { useEffect, useRef, useState } from "react";
import { ThemedButton } from "@/src/frontend/components/common/ThemedButton";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../../MainNavigation";
import UploadIcon from "react-native-vector-icons/Octicons";
import TextEntry from "@/src/frontend/components/common/TextEntry";
import * as ImagePicker from "expo-image-picker";

type ProfileDetailScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "OTP"
>;

export default function ProfileDetailsScreen() {
  const navigation = useNavigation<ProfileDetailScreenNavigationProp>();

  const [email, setEmail] = useState<string | undefined>();
  const [password, setPassword] = useState<string | undefined>();
  const [verifyPassword, setVerifyPassword] = useState<string | undefined>();
  const [image, setImage] = useState<string[] | undefined>();
  const [valid, setValid] = useState(false);

  useEffect(() => {
    if (valid) {
      navigation.navigate("Login");
    }
  }, [valid]);

  const createAccount = () => {};

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "You need to grant camera permissions."
      );
      return false;
    }
    return true;
  };

  const handleGalleryLaunch = async () => {
    const permissionGranted = await requestPermission();
    if (!permissionGranted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.5,
      selectionLimit: 1,
    });

    if (!result.canceled) {
      setImage(result.assets.map((asset) => asset.uri));
    }
  };

  return (
    <ThemedView className="flex-1">
      <View className="header flex mx-8 my-10 gap-16">
        <ChevronLeftIcon name="chevron-left" size={24} />
        <ThemedText className="px-30" type="title">
          <Text style={{ color: "#0057FF" }}>Almost</Text> there!
        </ThemedText>
      </View>
      <View className="header flex mx-8 gap-8 items-center justify-center">
        <View className="profile-photo rounded-full flex justify-center items-center">
          {!image && (
            <View className="flex w-28 h-28  bg-[#D9D9D9] flex justify-center rounded-full items-center">
              <UploadIcon
                name="upload"
                size={36}
                className=" "
                color="#ffffff"
                onPress={handleGalleryLaunch}
              />
            </View>
          )}
          {image && (
            <View className="flex flex-col w-full items-center">
              <Image
                source={{ uri: image[0] }}
                className="w-28 h-28  rounded-full flex justify-center  "
              />
              <TouchableOpacity onPress={handleGalleryLaunch}>
                <ThemedText type="link">Change photo</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View className="text-boxes flex flex-col gap-4 w-full">
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
          </View>
          <View className="verify-password-container flex flex-col w-full gap-2">
            <ThemedText type="defaultBold" style={{ color: "#757575" }}>
              Confirm Password
            </ThemedText>
            <TextEntry
              className="password-text w-full"
              value={verifyPassword}
              placeholder=""
              setValue={setVerifyPassword}
              textContentType="password"
              keyboardType="visible-password"
            />
          </View>

          <ThemedButton type="primary" bold onPress={createAccount}>
            Next
          </ThemedButton>
        </View>
      </View>
    </ThemedView>
  );
}
