import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { ThemedButton } from "../common/ThemedButton";

interface Props {
  filters: string[];
  selectedFilters: string[];
  setSelectedFilters: (selectedFilters: string[]) => void;
}
export default function AlertFilterButtons({
  filters,
  selectedFilters,
  setSelectedFilters,
}: Props) {
  return (
    <View className="flex flex-row flex-wrap gap-1">
      {filters.map((filter) => (
        <ThemedButton
          key={filter}
          type={selectedFilters.includes(filter) ? "primary" : "disabled"}
          icon={
            filter === "Amenity"
              ? "business"
              : filter === "Service Disruption"
              ? "business"
              : "information-circle-sharp"
          }
          size="small"
          onPress={() => {
            if (selectedFilters.includes(filter)) {
              setSelectedFilters(
                selectedFilters.filter((item) => item !== filter)
              );
            } else setSelectedFilters([...selectedFilters, filter]);
          }}
        >
          {filter}
        </ThemedButton>
      ))}
    </View>
  );
}
