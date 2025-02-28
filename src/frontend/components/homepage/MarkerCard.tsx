import { BlurView } from "expo-blur";
import { ViewProps } from "react-native";
import { View, TouchableOpacity, Image } from "react-native";
import { ThemedText } from "../ThemedText";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Stop } from "../../types/transitTypes";

export interface Props {
  stop: Stop;
  handleNotify: (stop: Stop) => void;
}

export default function MarkerCard({ stop, handleNotify }: Props) {
  return (
    <BlurView
      key={stop.StopName}
      intensity={100}
      className="w-[80vw] p-4 flex-1 m-[5vw] gap-3 overflow-hidden rounded flex-row items-center justify-between"
    >
      <View className="flex-1">
        <ThemedText type="defaultBold">{stop.StopName} Station</ThemedText>
        <ThemedText type="description" className="pr-5">
          {stop.StreetNumber} {stop.StreetName}
        </ThemedText>
      </View>
      <View className="flex-2">
        <TouchableOpacity
          onPress={() => handleNotify(stop)}
          className="border border-[#0057FF] py-1 rounded flex-row items-center"
        >
          <Icon
            className="pl-3 pr-1"
            color={"#0057FF"}
            name="notifications"
            size={16}
          />
          <ThemedText type="link" className="pr-3">
            Get Notifed
          </ThemedText>
        </TouchableOpacity>
      </View>
    </BlurView>
  );
}
