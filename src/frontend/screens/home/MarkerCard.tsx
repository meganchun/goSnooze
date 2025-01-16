import { BlurView } from "expo-blur";
import { ViewProps } from "react-native";
import { View, TouchableOpacity, Image } from "react-native";
import { ThemedText } from "../../components/ThemedText";
import Icon from "react-native-vector-icons/MaterialIcons";

export interface Props {
  stop: {
    index: number;
    stopName: string;
    streetNumber: number;
    streetName: string;
    longitude: number;
    latitude: number;
  };
}

export default function MarkerCard({ stop }: Props) {
  return (
    <BlurView
      key={stop.index}
      intensity={100}
      className="w-[80vw] p-4 flex-1 m-[5vw] overflow-hidden rounded flex-row items-center justify-between"
    >
      <View className="flex-1">
        <ThemedText type="defaultBold">{stop.stopName} Station</ThemedText>
        <ThemedText type="description" className="pr-5">
          {stop.streetNumber} {stop.streetName}
        </ThemedText>
      </View>
      <View className="flex-2">
        <TouchableOpacity className="border border-[#0057FF] py-3 rounded flex-row items-center">
          <Icon
            className="pl-7 pr-1"
            color={"#0057FF"}
            name="notifications"
            size={16}
          />
          <ThemedText type="link" className="pr-7">
            Get Notifed
          </ThemedText>
        </TouchableOpacity>
      </View>
    </BlurView>
  );
}
