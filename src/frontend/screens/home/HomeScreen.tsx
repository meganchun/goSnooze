import React, { useState, useRef, useEffect } from "react";
import { BlurView } from "expo-blur";
import {
  View,
  Animated,
  Text,
  type ViewProps,
  TouchableOpacity,
  Switch,
} from "react-native";
import MapView, { Marker, MarkerAnimated } from "react-native-maps";
import { ThemedView } from "../../components/ThemedView";
import { ThemedText } from "../../components/ThemedText";
import TrainLinesButtons from "../../components/homepage/TrainLinesButtons";
import MarkerCard from "../../components/homepage/MarkerCard";
import { Dimensions } from "react-native";
import { useThemeColour } from "../../hooks/useThemeColour";
import { Line, Stop } from "../../types/transitTypes";
import AlarmCard from "../../components/homepage/AlarmCard";
import { getStopsOnLine, getStopDetails } from "../../services/transitService";
import { useLocation } from "../../context/LocationContext";
import { calculateDistance } from "../../services/distanceService";

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

  const [alarmOn, setAlarmOn] = useState(false);
  const [activeLine, setActiveLine] = useState<Line | null>(null);
  const [stopCodes, setStopCodes] = useState<string[] | null>(null);
  const [markers, setMarkers] = useState<Stop[]>([]);
  const [activeStation, setActiveStation] = useState<Stop | null>(null);
  const [isTrain, setIsTrain] = useState(true);

  const { location, error } = useLocation();

  const tempUser = {
    name: "Megan",
    number: "",
  };

  // Listener to handle map animations
  const mapAnimation = useRef(new Animated.Value(0));
  const mapRef = useRef<MapView>(null);

  // Animation to markers
  useEffect(() => {
    const listener = mapAnimation.current.addListener(({ value }) => {
      // Determine active marker
      const index = Math.floor(value / (windowWidth * 0.9) + 0.3);
      if (mapRef.current && markers[index]) {
        const coordinate = markers[index];
        mapRef.current.animateToRegion(
          {
            latitude: coordinate.Latitude,
            longitude: coordinate.Longitude,
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

  // Animation to show all lines
  useEffect(() => {
    if (markers.length > 0 && mapRef.current) {
      const latitudes = markers.map((marker) => marker.Latitude);
      const longitudes = markers.map((marker) => marker.Longitude);

      const minLat = Math.min(...latitudes);
      const maxLat = Math.max(...latitudes);
      const minLon = Math.min(...longitudes);
      const maxLon = Math.max(...longitudes);

      const padding = 0.05;
      const region = {
        latitude: (minLat + maxLat) / 2,
        longitude: (minLon + maxLon) / 2,
        latitudeDelta: maxLat - minLat + padding,
        longitudeDelta: maxLon - minLon + padding,
      };

      mapRef.current.animateToRegion(region, 500);
    }
  }, [markers]);

  // Animate to users location
  useEffect(() => {
    if (location && mapRef.current) {
      const region = {
        latitude: location?.coords.latitude,
        longitude: location?.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };

      mapRef.current.animateToRegion(region, 500);
    }
    // If the user set a location stop
    if (alarmOn && location && activeStation) {
      // Check if it enters within a 5km radius
      if (
        calculateDistance(
          {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          },
          {
            longitude: activeStation.Longitude,
            latitude: activeStation.Latitude,
          }
        ) < 5
      ) {
        console.log(true);
      }
    }
  }, [location]);

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

  // Fetch stops
  useEffect(() => {
    const fetchStops = async () => {
      if (activeLine) {
        try {
          const fetchedStops = await getStopsOnLine(
            activeLine.Code,
            activeLine.Variant[0].Direction
          );
          setStopCodes(fetchedStops.Lines.Stop.map((stop: any) => stop.Code));
        } catch (error) {}
      }
    };

    fetchStops();
  }, [activeLine]);

  // Fetch stop details
  useEffect(() => {
    const fetchStopDetails = async () => {
      if (stopCodes && stopCodes.length > 0) {
        try {
          const stopDetails: Stop[] = await Promise.all(
            stopCodes.map(async (stop) => {
              const fetchedDetails = await getStopDetails(stop);

              const stopInfo: Stop = {
                Code: fetchedDetails.Stop.Code,
                StreetNumber: fetchedDetails.Stop.StreetNumber,
                Intersection: fetchedDetails.Stop.Intersection,
                City: fetchedDetails.Stop.City,
                StreetName: fetchedDetails.Stop.StreetName,
                StopName: fetchedDetails.Stop.StopName,
                Longitude: fetchedDetails.Stop.Longitude,
                Latitude: fetchedDetails.Stop.Latitude,
              };
              return stopInfo;
            })
          );
          setMarkers(stopDetails);
        } catch (error) {
          console.error("Error fetching stop details:", error);
        }
      }
    };
    fetchStopDetails();
  }, [stopCodes]);

  const cancelAlarm = () => {
    setAlarmOn(!alarmOn);
  };

  const handleNotify = (stop: Stop) => {
    setActiveStation(stop);
    setAlarmOn(true);
  };

  const toggleSwitch = () => setIsTrain((previousState) => !previousState);

  return (
    <ThemedView className="flex-1">
      <ThemedView className="flex flex-row justify-space-between items-center text-center">
        <ThemedText type="title" className="font-bold px-6 py-4">
          Go snooze, {tempUser.name}
        </ThemedText>
      </ThemedView>

      <View className="flex-1 mx-6">
        <View className="h-10px flex-row ">
          <TrainLinesButtons setActiveLine={setActiveLine} />
        </View>
        <View className="overflow-hidden rounded-2xl my-4 flex-1 relative">
          <MapView style={{ flex: 1 }} ref={mapRef}>
            {markers &&
              markers.map((stop, index) => {
                const scale = interpolations[index].scale;

                return (
                  <MarkerAnimated
                    key={index}
                    coordinate={{
                      longitude: stop.Longitude,
                      latitude: stop.Latitude,
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
            {location && (
              <Marker
                coordinate={{
                  longitude: location.coords.longitude,
                  latitude: location.coords.latitude,
                }}
              ></Marker>
            )}
          </MapView>

          {/* Alarm set card */}
          {alarmOn && activeStation && (
            <AlarmCard
              activeStation={activeStation}
              cancelAlarm={cancelAlarm}
            />
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
                <MarkerCard
                  key={index}
                  stop={marker}
                  handleNotify={handleNotify}
                ></MarkerCard>
              ))}
            </Animated.ScrollView>
          )}
        </View>
      </View>
    </ThemedView>
  );
}
