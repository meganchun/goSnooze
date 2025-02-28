import React from "react";
import { View, TouchableOpacity, Alert } from "react-native";
import MapView, { Marker, MarkerAnimated } from "react-native-maps";
import { ThemedView } from "../../components/ThemedView";
import { ThemedText } from "../../components/ThemedText";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Stop } from "../../types/transitTypes";

interface Props {
  activeStation: Stop;
  cancelAlarm: () => void;
}
export default function AlarmCard({ activeStation, cancelAlarm }: Props) {
  const confirmCancel = () => {
    Alert.alert(
      "Cancel Notification",
      `Are you sure you want to cancel you're notification for ${activeStation.StopName}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: () => cancelAlarm,
        },
      ],
      { cancelable: false }
    );
  };
  return (
    <View className="flex-row bg-[#0057FF] w-[80vw] absolute rounded bottom-0 m-[5vw] p-5 justify-between">
      <View className="arrival-station flex-1">
        <ThemedText type="description_light">Alarm set for:</ThemedText>
        <ThemedText type="subtitle_light">{activeStation.StopName}</ThemedText>
      </View>
      <View className="arrival-time ">
        <ThemedText type="description_light">
          Estimated time of arrival:
        </ThemedText>
        <ThemedText type="subtitle_light">10:50 AM</ThemedText>
      </View>
      <TouchableOpacity
        className="absolute -top-4 -right-4 bg-[#FFFF] w-8 h-8 rounded-full items-center justify-center"
        onPress={confirmCancel}
      >
        <Icon name="close" size={16} color="#0057FF" />
      </TouchableOpacity>
    </View>
  );
}
