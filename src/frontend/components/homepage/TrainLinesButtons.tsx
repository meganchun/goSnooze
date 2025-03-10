import React, { useEffect, useState } from "react";
import { ScrollView, type ViewProps } from "react-native";
import { useThemeColour } from "../../hooks/useThemeColour";
import { getLines } from "@/src/frontend/services/transitService";
import { Line } from "@/src/frontend/types/transitTypes";
import { ThemedButton } from "../common/ThemedButton";

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
        lines.map((line) => (
          <ThemedButton
            className="mx-2"
            type={selectedButton === line.Code ? "primary" : "disabled"}
            onPress={() => {
              setActiveLine(line), setSelectedButton(line.Code);
            }}
          >
            {line.Name}
          </ThemedButton>
        ))}
    </ScrollView>
  );
}
