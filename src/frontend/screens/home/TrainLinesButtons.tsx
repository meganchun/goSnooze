import React, { useEffect, useState } from "react";
import { ScrollView, TouchableOpacity, type ViewProps } from "react-native";
import { ThemedText } from "../../components/ThemedText";
import { useThemeColour } from "../../hooks/useThemeColour";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export default function TrainLinesButtons({
  lightColor,
  darkColor,
  ...otherProps
}: ThemedViewProps) {
  const selectedIconColour = useThemeColour(
    { light: lightColor, dark: darkColor },
    "iconSelected"
  );
  const [selectedButton, setSelectedButton] = useState<number | null>(null);

  const trainLines = [
    { name: "Stouffville" },
    { name: "Kitchener" },
    { name: "Barrie" },
    { name: "Lakeshore" },
  ];

  const handlePress = (index: number) => {
    setSelectedButton(index);
  };

  return (
    <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
      {trainLines.map((line, index) => (
        <TouchableOpacity
          style={{
            backgroundColor: selectedButton == index ? "#0057FF" : "#D9D9D9",
          }}
          className="mx-2 py-3 px-5 rounded"
          key={index}
          onPress={() => handlePress(index)}
        >
          <ThemedText style={{ color: "#fff" }}>{line.name}</ThemedText>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
