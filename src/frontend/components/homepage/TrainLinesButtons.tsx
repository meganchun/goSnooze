import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Touchable,
  TouchableOpacity,
  type ViewProps,
} from "react-native";
import { ThemedText } from "../ThemedText";
import { useThemeColour } from "../../hooks/useThemeColour";
import { GET_AVAILABLE_TRAIN_LINES } from "@/src/frontend/graphql/Queries/TransitQueries";
import { useQuery } from "@apollo/client";
import dayjs from "dayjs";
import { getLines } from "@/src/frontend/services/transitService";
import { Line } from "@/src/frontend/types/transitTypes";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  setActiveLine: (line: Line | null) => void;
};

export default function TrainLinesButtons({
  lightColor,
  darkColor,
  setActiveLine,
  ...otherProps
}: ThemedViewProps) {
  const selectedIconColour = useThemeColour(
    { light: lightColor, dark: darkColor },
    "iconSelected"
  );
  const [selectedButton, setSelectedButton] = useState<String | null>(null);
  const [isTrains, setIsTrains] = useState(true);
  const [lines, setLines] = useState<null | Line[]>(null);

  // Fetch lines
  useEffect(() => {
    const fetchLines = async () => {
      try {
        const fetchedLines = await getLines();
        setLines(
          fetchedLines.AllLines.Line.filter(
            (line: Line) => line.IsTrain === isTrains
          )
        );
      } catch (error) {
        console.error("Error fetching lines:", error);
      }
    };
    fetchLines();
  }, []);

  return (
    <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
      {lines &&
        lines.map((line, index) => (
          <TouchableOpacity
            style={{
              backgroundColor:
                selectedButton == line.Code ? "#0057FF" : "#D9D9D9",
            }}
            className="mx-2 py-2 px-4 rounded"
            key={index}
            onPress={() => {
              setActiveLine(line), setSelectedButton(line.Code);
            }}
          >
            <ThemedText style={{ color: "#fff" }}>{line.Name}</ThemedText>
          </TouchableOpacity>
        ))}
    </ScrollView>
  );
}
