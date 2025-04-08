import { ThemedText } from "@/src/frontend/components/common/ThemedText";
import { ThemedView } from "@/src/frontend/components/common/ThemedView";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import ChevronLeftIcon from "react-native-vector-icons/FontAwesome6";
import { useState } from "react";
import { ThemedButton } from "@/src/frontend/components/common/ThemedButton";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../../MainNavigation";
import UploadIcon from "react-native-vector-icons/Octicons";
import TextEntry from "@/src/frontend/components/common/TextEntry";
import * as ImagePicker from "expo-image-picker";
import { Colours } from "@/src/frontend/constants/Colours";
import Icon from "react-native-vector-icons/Ionicons";
import { useAuth } from "@/src/frontend/context/AuthContext";

type ProfileDetailScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "ProfileDetails"
>;

type PasswordRule =
  | "At least 8 characters"
  | "At least one number or symbol"
  | "One lowercase character"
  | "One uppercase character";

export default function ProfileDetailsScreen() {
  const navigation = useNavigation<ProfileDetailScreenNavigationProp>();

  const { createUser } = useAuth();

  const [email, setEmail] = useState<string | undefined>();
  const [password, setPassword] = useState<string | undefined>();
  const [verifyPassword, setVerifyPassword] = useState<string>();
  const [image, setImage] = useState<string[] | undefined>();
  const [passwordMatchError, setPasswordMatchError] = useState<boolean>(false);
  const [passwordChecklist, setPasswordChecklist] = useState<
    Record<PasswordRule, boolean>
  >({
    "At least 8 characters": false,
    "At least one number or symbol": false,
    "One lowercase character": false,
    "One uppercase character": false,
  });

  const passwordError = Object.values(passwordChecklist).some(
    (value) => value === true
  );

  const createAccount = () => {
    if (!passwordMatchError && !passwordError && email) {
      createUser(email, "test", image ? image[0] : undefined);
    }
  };

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

  const handlePasswordChange = (value: string) => {
    setVerifyPassword(value);
    if (value !== password) setPasswordMatchError(true);
    else setPasswordMatchError(false);
  };

  return (
    <ThemedView className="flex-1">
      <View className="header flex mx-8 my-10 gap-16">
        <ChevronLeftIcon
          name="chevron-left"
          size={24}
          onPress={navigation.goBack}
        />
        <ThemedText className="px-30" type="title">
          <Text style={{ color: "#0057FF" }}>Almost</Text> there!
        </ThemedText>
      </View>
      <View className="header flex mx-8 gap-8 items-center justify-center">
        <View className="profile-photo rounded-full flex justify-center items-center">
          {!image && (
            <>
              <View className="flex w-28 h-28  bg-[#D9D9D9] flex justify-center rounded-full items-center">
                <UploadIcon
                  name="upload"
                  size={36}
                  className=" "
                  color="#ffffff"
                  onPress={handleGalleryLaunch}
                />
              </View>
              <TouchableOpacity onPress={handleGalleryLaunch}>
                <ThemedText type="link">Upload a photo</ThemedText>
              </TouchableOpacity>
            </>
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
          <View className="username-container flex flex-col w-full gap-1">
            <ThemedText type="default">Email</ThemedText>
            <TextEntry
              className="email-text w-full"
              value={email}
              setValue={setEmail}
              placeholder="example@gmail.com"
              keyboardType="email-address"
              textContentType="emailAddress"
            />
          </View>
          <View className="password-container flex flex-col w-full gap-1">
            <ThemedText type="default">Password</ThemedText>
            <TextEntry
              className="password-text w-full"
              value={password}
              placeholder=""
              setValue={setPassword}
              textContentType="password"
              keyboardType="visible-password"
            />
          </View>
          <View className="verify-password-container flex flex-col w-full gap-1">
            <ThemedText type="default">Confirm Password</ThemedText>
            <TextEntry
              className="password-text w-full"
              value={verifyPassword}
              placeholder=""
              setValue={(value) => handlePasswordChange(value || "")}
              textContentType="password"
              keyboardType="visible-password"
              warning={
                passwordMatchError ? "Passwords do not match" : undefined
              }
            />
          </View>
          <View className="flex flex-col gap-1">
            {(Object.keys(passwordChecklist) as PasswordRule[]).map(
              (option) => (
                <View className="flex flex-row items-center gap-1">
                  <Icon
                    name="checkmark-circle"
                    style={{
                      color: passwordChecklist[option]
                        ? Colours.constant.approved
                        : Colours.constant.danger,
                    }}
                  />
                  <ThemedText
                    key={option}
                    type="description"
                    style={{
                      color: passwordChecklist[option]
                        ? Colours.constant.approved
                        : Colours.constant.danger,
                    }}
                  >
                    {option}
                  </ThemedText>
                </View>
              )
            )}
          </View>
          <ThemedButton
            className="w-full "
            type="primary"
            bold
            onPress={createAccount}
          >
            Next
          </ThemedButton>
        </View>
      </View>
    </ThemedView>
  );
}
