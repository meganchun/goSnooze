import React from "react";
import { View, Image, TouchableOpacity, ViewProps, Text } from "react-native";
import { ThemedView } from "../../../components/common/ThemedView";
import { ThemedText } from "../../../components/common/ThemedText";
import Icon from "react-native-vector-icons/MaterialIcons";
import ChevronRightIcon from "react-native-vector-icons/FontAwesome6";
import { useThemeColour } from "../../../hooks/useThemeColour";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../MainNavigation";
import { useNavigation } from "@react-navigation/native";

import { signOut } from "firebase/auth";
import { auth } from "@/src/backend/firebase";
import { useAuth } from "@/src/frontend/context/AuthContext";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

type SettingNavigationProp = StackNavigationProp<RootStackParamList>;

export default function SettingsScreen({
  style,
  lightColor,
  darkColor,
  ...otherProps
}: ThemedViewProps) {
  const navigation = useNavigation<SettingNavigationProp>();
  const { logout } = useAuth();

  const textColour = useThemeColour(
    { light: lightColor, dark: darkColor },
    "text"
  );

  const settingSubTabs = [
    { title: "Personal Information", icon: "person" },
    { title: "Notfications", icon: "notifications" },
    { title: "Privacy", icon: "lock" },
    { title: "Logout", icon: "logout" },
    { title: "Delete Account", icon: "delete" },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await logout();
    } catch (error: any) {
      console.error("Error logging out: ", error.message);
    }
  };
  return (
    <ThemedView className="flex-1">
      <View className="page-container mx-6">
        <ThemedText type="title" className="font-bold py-4">
          Profile
        </ThemedText>
        <View className="settings-content ">
          <TouchableOpacity className="profile flex-row items-center justify-between mx-1 my-5">
            <View className="flex-row items-center">
              <Image
                source={require("../../../../../assets/snoozeLogo-white.png")}
                className="mr-4 size-16 p-3 bg-[#0057FF] rounded-full"
              />
              <View>
                <ThemedText type="defaultHeavy">Megan Chun</ThemedText>
                <ThemedText>Show profile</ThemedText>
              </View>
            </View>
            <ChevronRightIcon
              name="chevron-right"
              size={14}
              color={textColour}
            />
          </TouchableOpacity>
          <ThemedText type="subtitle" className="font-bold my-4 mb-6">
            Account Settings
          </ThemedText>
          {settingSubTabs.map((tab, index) => (
            <TouchableOpacity
              key={index}
              className="mb-6 mx-1"
              onPress={() => {
                tab.icon === "logout"
                  ? handleLogout()
                  : navigation.navigate("Main");
              }}
            >
              <View className="flex-row mb-6 justify-between items-center">
                <View className="flex-row items-center ">
                  <Icon
                    name={tab.icon}
                    size={24}
                    color={tab.icon === "delete" ? "#e83a3a" : textColour}
                    className="mr-5"
                  />
                  <ThemedText
                    type={tab.icon === "delete" ? "warning" : "default"}
                  >
                    {tab.title}
                  </ThemedText>
                </View>
                <ChevronRightIcon
                  name="chevron-right"
                  size={14}
                  color={textColour}
                />
              </View>
              <View
                className={`divider-line border-[0.35px] border-[${textColour}]`}
              ></View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ThemedView>
  );
}
