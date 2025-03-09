import React, { useEffect, useState } from "react";
import { ScrollView, TouchableOpacity, type ViewProps } from "react-native";
import { ThemedText } from "../ThemedText";
import { useThemeColour } from "../../hooks/useThemeColour";
import { getLines } from "@/src/frontend/services/transitService";
import { Line } from "@/src/frontend/types/transitTypes";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  setActiveLine: (line: Line | null) => void;
  mode: "train" | "bus";
};

export default function TrainLinesButtons({
  lightColor,
  darkColor,
  setActiveLine,
  mode,
  ...otherProps
}: ThemedViewProps) {
  const selectedIconColour = useThemeColour(
    { light: lightColor, dark: darkColor },
    "iconSelected"
  );
  const [selectedButton, setSelectedButton] = useState<String | null>(null);
  const [lines, setLines] = useState<null | Line[]>(null);

  // Fetch lines
  useEffect(() => {
    const fetchLines = async () => {
      try {
        const fetchedLines = await getLines();
        setLines(
          fetchedLines.AllLines.Line.filter(
            (line: Line) => line.IsTrain === (mode === "train")
          )
        );
      } catch (error) {
        console.error("Error fetching lines:", error);
      }
    };
    fetchLines();
  }, [mode]);

  return (
    <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
      {lines &&
        lines.map((line, index) => (
          <TouchableOpacity
            style={{
              backgroundColor:
                selectedButton == line.Code ? selectedIconColour : "#D9D9D9",
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
