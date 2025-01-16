import React, { useState, useRef, useEffect } from "react";
import { BlurView } from "expo-blur";
import {
  View,
  Animated,
  Text,
  type ViewProps,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker, MarkerAnimated } from "react-native-maps";
import { ThemedView } from "../../components/ThemedView";
import { ThemedText } from "../../components/ThemedText";
import TrainLinesButtons from "./TrainLinesButtons";
import MarkerCard from "./MarkerCard";
import { Dimensions } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useThemeColour } from "../../hooks/useThemeColour";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export interface Props {
  marker: {
    latitude: number;
    longitude: number;
    stopName: string;
    streetNumber: number;
    streetName: string;
    index: number;
  };
}

export default function HomeScreen({
  lightColor,
  darkColor,
  ...otherProps
}: ThemedViewProps) {
  // theme constants
  const themeColour = useThemeColour(
    { light: lightColor, dark: darkColor },
    "tint"
  );
  const windowWidth = Dimensions.get("window").width;

  const name = "Megan";

  // Alarm data
  const [alarmOn, setAlarmOn] = useState(true);
  const [activeStation, setActiveStation] = useState({
    name: "Union Station",
    time: "5:30PM EST",
  });

  // TO DO: Get users location and set region as that
  const [region, setRegion] = useState({
    latitude: 43.6426,
    longitude: -79.3871,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // TO DO: Get markers of station
  const [markers, setMarkers] = useState([
    {
      latitude: 43.6426,
      longitude: -79.3871,
      stopName: "Union",
      streetNumber: 1,
      streetName: "King Street",
      index: 1,
    },
    {
      latitude: 43.6451991,
      longitude: -79.3837245,
      stopName: "Test",
      streetNumber: 1,
      streetName: "King Street",
      index: 2,
    },
    {
      latitude: 43.656707763671875,
      longitude: -79.37975311279297,
      stopName: "Test",
      streetNumber: 1,
      streetName: "King Street",
      index: 3,
    },
    {
      latitude: 43.7080726,
      longitude: -79.3483886,
      stopName: "Test",
      streetNumber: 1,
      streetName: "King Street",
      index: 4,
    },
  ]);

  // Listener to handle map animations
  const mapAnimation = useRef(new Animated.Value(0));
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    const listener = mapAnimation.current.addListener(({ value }) => {
      // Determine active marker
      const index = Math.floor(value / (windowWidth * 0.9) + 0.3);
      if (mapRef.current && markers[index]) {
        const coordinate = markers[index];
        mapRef.current.animateToRegion(
          {
            latitude: coordinate.latitude,
            longitude: coordinate.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          },
          200
        );
      }
    });

    return () => {
      mapAnimation.current.removeListener(listener);
    };
  }, [markers, windowWidth]);

  const interpolations = markers.map((marker, index) => {
    const inputRange = [
      (index - 1) * windowWidth * 0.9,
      index * windowWidth * 0.9,
      (index + 1) * windowWidth * 0.9,
    ];

    const scale = mapAnimation.current.interpolate({
      inputRange,
      outputRange: [1, 1.5, 1],
      extrapolate: "clamp",
    });

    return { scale };
  });

  const cancelAlarm = () => {
    setAlarmOn(!alarmOn);
  };

  return (
    <ThemedView className="flex-1">
      <ThemedText type="title" className="font-bold px-6 py-4">
        Go snooze, {name}
      </ThemedText>
      <View className="flex-1 mx-6">
        <View className="h-10px flex-row ">
          <TrainLinesButtons />
        </View>
        <View className="overflow-hidden rounded-2xl my-4 flex-1 relative">
          <MapView style={{ flex: 1 }} initialRegion={region} ref={mapRef}>
            {markers &&
              markers.map((stop, index) => {
                const scale = interpolations[index].scale;

                return (
                  <MarkerAnimated
                    key={index}
                    coordinate={{
                      longitude: stop.longitude,
                      latitude: stop.latitude,
                    }}
                  >
                    <Animated.View
                      style={{
                        position: "absolute",
                        transform: [{ scale }],
                      }}
                    >
                      <Animated.Image
                        className="w-8 h-8"
                        source={require("../../../../assets/locationPin.png")}
                        resizeMode="cover"
                      />
                    </Animated.View>
                  </MarkerAnimated>
                );
              })}
          </MapView>

          {/* Alarm set modal */}
          {alarmOn && (
            <View className="flex-row bg-[#0057FF] w-[80vw] absolute rounded bottom-0 m-[5vw] p-5 justify-between">
              <View className="arrival-station flex-1">
                <ThemedText type="description_light">Alarm set for:</ThemedText>
                <ThemedText type="subtitle_light">
                  {activeStation.name}
                </ThemedText>
              </View>
              <View className="arrival-time flex-1">
                <ThemedText type="description_light">
                  Estimated time of arrival:
                </ThemedText>
                <ThemedText type="subtitle_light">
                  {activeStation.time}
                </ThemedText>
              </View>
              <TouchableOpacity
                className="absolute -top-4 -right-4 bg-[#FFFF] w-8 h-8 rounded-full items-center justify-center"
                onPress={cancelAlarm}
              >
                <Icon name="close" size={16} color="#0057FF" />
              </TouchableOpacity>
            </View>
          )}

          {/* Stop marker cards */}
          {markers && !alarmOn && (
            <Animated.ScrollView
              className="absolute bottom-0"
              horizontal={true}
              snapToInterval={windowWidth * 0.9}
              disableIntervalMomentum={true}
              decelerationRate="fast"
              showsHorizontalScrollIndicator={false}
              onScroll={Animated.event(
                [
                  {
                    nativeEvent: {
                      contentOffset: {
                        x: mapAnimation.current,
                      },
                    },
                  },
                ],
                { useNativeDriver: true }
              )}
            >
              {markers.map((marker, index) => (
                <MarkerCard key={index} stop={marker}></MarkerCard>
              ))}
            </Animated.ScrollView>
          )}
        </View>
      </View>
    </ThemedView>
  );
}
