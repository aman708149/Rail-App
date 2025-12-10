import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface TrainScheduleErrorProps {
  oldDeparture?: string;
  newDeparture?: string;
  oldArrival?: string;
  newArrival?: string;
}

export default function TrainScheduleError({
  oldDeparture,
  newDeparture,
  oldArrival,
  newArrival,
}: TrainScheduleErrorProps) {
  const router = useRouter();

  // Build changes list
  const changes = [];
  if (oldDeparture !== newDeparture) {
    changes.push({
      label: "Departure Time",
      oldValue: oldDeparture,
      newValue: newDeparture,
    });
  }
  if (oldArrival !== newArrival) {
    changes.push({
      label: "Arrival Time",
      oldValue: oldArrival,
      newValue: newArrival,
    });
  }

  return (
    <View className="flex-1 items-center justify-center p-4">
      <View className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-xl">
        {/* Warning icon */}
        <View className="items-center mb-4">
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={60}
            color="red"
          />
        </View>

        {/* Title */}
        <Text className="text-xl font-bold text-red-600 text-center mb-3">
          <MaterialCommunityIcons name="train" size={20} /> Train Schedule Updated
        </Text>

        <Text className="text-center text-gray-600 dark:text-gray-300 mb-4">
          The train schedule has changed. Please search again to check the latest
          timings.
        </Text>

        {/* Change details */}
        <View className="w-full">
          {changes.length > 0 ? (
            changes.map((item) => (
              <View
                key={item.label}
                className="flex-row justify-between items-center p-3 bg-red-100 dark:bg-red-900 rounded-xl mb-3"
              >
                <Text className="font-semibold">{item.label}</Text>
                <View className="flex-row items-center">
                  <Text className="text-red-600 dark:text-red-400 mr-2 min-w-[60px] text-right">
                    {item.oldValue || "--"}
                  </Text>

                  <MaterialCommunityIcons
                    name="arrow-right-bold"
                    size={20}
                    color="red"
                  />

                  <Text className="font-bold ml-2 min-w-[60px] text-left">
                    {item.newValue || "--"}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text className="text-center text-gray-400">
              No time changes detected.
            </Text>
          )}
        </View>

        {/* Footer */}
        <View className="mt-6 items-center">
          <TouchableOpacity
            onPress={async () => {
              await AsyncStorage.setItem("ScheduleUpdated", "true");
              router.back();
            }}
            className="bg-gray-800 py-3 px-6 rounded-xl flex-row items-center"
          >
            <MaterialCommunityIcons name="arrow-left" size={20} color="#fff" />
            <Text className="ml-2 text-white font-medium">Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
