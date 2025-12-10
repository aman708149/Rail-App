import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useDispatch } from "react-redux";
import { MaterialIcons } from "@expo/vector-icons"; // For arrow icons
import { sortTrains } from "@/src/store/rail/trainBetweenStation/trainSlice";

export default function SortingCard() {
  const [sortConfig, setSortConfig] = useState({
    key: "departureTime",
    direction: "asc",
  });

  const dispatch = useDispatch();

  const handleSort = (key: any) => {
    let direction: "asc" | "desc" = "asc";

    if (sortConfig.key === key) {
      direction = sortConfig.direction === "asc" ? "desc" : "asc";
    }

    setSortConfig({ key, direction });
    dispatch(sortTrains({ key, direction }));
  };

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return null;

    return sortConfig.direction === "asc" ? (
      <MaterialIcons name="arrow-downward" size={16} color="green" />
    ) : (
      <MaterialIcons name="arrow-upward" size={16} color="green" />
    );
  };

  const isActive = (key: string) => sortConfig.key === key;

  return (
    <View className="bg-gray-900 rounded-xl shadow p-2 mt-2">
      <View className="flex-row flex-wrap justify-between items-center w-full">

        {/* Train No */}
        <TouchableOpacity
          onPress={() => handleSort("trainNumber")}
          className="flex-row items-center"
        >
          <Text className={`${isActive("trainNumber") ? "text-green-600" : "text-gray-100"} font-medium`}>
            Train No
          </Text>
          {getSortIcon("trainNumber")}
        </TouchableOpacity>


        {/* Distance */}
        <TouchableOpacity
          onPress={() => handleSort("distance")}
          className="flex-row items-center"
        >
          <Text className={`${isActive("distance") ? "text-green-600" : "text-gray-100"} font-medium`}>
            Distance
          </Text>
          {getSortIcon("distance")}
        </TouchableOpacity>

        {/* Train Name */}
        <TouchableOpacity
          onPress={() => handleSort("trainName")}
          className="flex-row items-center"
        >
          <Text className={`${isActive("trainName") ? "text-green-600" : "text-gray-100"} font-medium`}>
            Train Name
          </Text>
          {getSortIcon("trainName")}
        </TouchableOpacity>

      </View>

      <View className="flex-row flex-wrap justify-between items-center w-full">

        {/* Departure */}
        <TouchableOpacity
          onPress={() => handleSort("departureTime")}
          className="flex-row items-center"
        >
          <Text className={`${isActive("departureTime") ? "text-green-600" : "text-gray-100"} font-medium`}>
            Departure
          </Text>
          {getSortIcon("departureTime")}
        </TouchableOpacity>

        {/* Duration */}
        <TouchableOpacity
          onPress={() => handleSort("duration")}
          className="flex-row items-center"
        >
          <Text className={`${isActive("duration") ? "text-green-600" : "text-gray-100"} font-medium`}>
            Duration
          </Text>
          {getSortIcon("duration")}
        </TouchableOpacity>

        {/* Arrival */}
        <TouchableOpacity
          onPress={() => handleSort("arrivalTime")}
          className="flex-row items-center"
        >
          <Text className={`${isActive("arrivalTime") ? "text-green-600" : "text-gray-100"} font-medium`}>
            Arrival
          </Text>
          {getSortIcon("arrivalTime")}
        </TouchableOpacity>

      </View>
    </View>
  );
}
