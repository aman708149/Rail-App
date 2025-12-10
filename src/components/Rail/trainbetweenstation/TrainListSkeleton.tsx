import React from "react";
import { View } from "react-native";

export default function TrainListSkeleton() {
  return (
    <View className="bg-[#0A1128] dark:bg-gray-800 w-full rounded-xl p-3 mt-3">

      {/* TOP ROW */}
      <View className="flex-row justify-between items-center">

        {/* LEFT SIDE */}
        <View>
          {/* Train Number Badge */}
          <View className="h-4 w-12 rounded-md bg-gray-600" />

          {/* Train Name */}
          <View className="h-3 w-28 rounded-md bg-gray-700 mt-1.5" />

          {/* Category */}
          <View className="h-2.5 w-14 rounded-md bg-gray-700 mt-1" />
        </View>

        {/* Dropdown circle */}
        <View className="h-7 w-7 rounded-full bg-gray-700" />
      </View>

      {/* DAYS */}
      <View className="flex-row space-x-1.5 mt-3">
        {[...Array(7)].map((_, i) => (
          <View key={i} className="h-2.5 w-3.5 rounded-sm bg-gray-600" />
        ))}
      </View>

      {/* STATION ROW */}
      <View className="flex-row justify-between items-center mt-3">
        <View className="h-3 w-10 rounded-md bg-gray-600" />
        <View className="h-3 w-5 rounded-md bg-gray-700" />
        <View className="h-3 w-10 rounded-md bg-gray-600" />
      </View>

      {/* TIME ROW */}
      <View className="flex-row justify-between items-center mt-2.5">
        <View className="h-3 w-18 rounded-md bg-gray-600" />
        <View className="h-3 w-18 rounded-md bg-gray-600" />
      </View>

      {/* HALTS */}
      <View className="h-2.5 w-16 rounded-md bg-gray-700 mt-3" />

      {/* DISTANCE + DURATION */}
      <View className="h-2.5 w-24 rounded-md bg-gray-700 mt-2" />
    </View>
  );
}
