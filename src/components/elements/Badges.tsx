// 📌 Badges.tsx (React Native Expo)

import React from "react";
import { View, Text } from "react-native";
import { Ionicons, FontAwesome6 } from "@expo/vector-icons"; // FaTrainSubway Alternative

type BadgesProps = {
  chartStatus?: string;
  trainNumber?: string;
  trainName?: string;
  journeyClass?: string;
  journeyQuota?: string;
};

/* ===================== ROUND BADGE ===================== */
export const RoundfullBadges = ({ chartStatus }: BadgesProps) => {
  return (
    <View className="flex justify-center items-center">
      <View className="bg-green-600 flex-row items-center rounded-full px-3 py-1 border border-gray-400">
        <View className="w-8 h-8 bg-green-500 rounded-full border-4 border-white justify-center items-center">
          <Ionicons name="checkmark" size={18} color="white" />
        </View>
        <Text className="text-white text-sm ml-2">
          {chartStatus ? chartStatus : "PNR Status"}
        </Text>
      </View>
    </View>
  );
};

/* ===================== SQUARE BADGE ===================== */
export const SquareBadges = ({ chartStatus }: BadgesProps) => {
  return (
    <View className="flex justify-center items-center">
      <View className="bg-green-600 flex-row items-center rounded-md px-3 py-1 border border-gray-400">
        <Text className="text-white text-sm">
          {chartStatus ? chartStatus : "PNR Status"}
        </Text>
      </View>
    </View>
  );
};

/* ===================== TRAIN BADGE ===================== */
export const TrainBadges = ({ trainName, trainNumber }: BadgesProps) => {
  return (
    <View className="flex justify-center items-center">
      <View className="bg-gray-300 dark:bg-gray-600 flex-row items-center rounded-md px-3 py-1">
        <View className="w-8 h-8 bg-red-500 rounded justify-center items-center">
          <FontAwesome6 name="train-subway" size={18} color="white" />
        </View>
        <Text className="text-black dark:text-white text-sm ml-2">
          {trainNumber ? trainNumber : "Set Train Number"}
          {trainName ? ` - ${trainName}` : ""}
        </Text>
      </View>
    </View>
  );
};

/* ===================== BIRD EYE VIEW (ONLY NUMBER) ===================== */
export const BirdEyeViewBadge = ({ trainNumber }: BadgesProps) => {
  return (
    <View className="flex justify-center items-center">
      <View className="bg-gray-300 dark:bg-gray-600 flex-row items-center rounded-md px-3 py-1">
        <View className="w-6 h-6 bg-red-500 rounded justify-center items-center">
          <FontAwesome6 name="train-subway" size={16} color="white" />
        </View>
        <Text className="text-black dark:text-white text-sm ml-2">
          {trainNumber || "Train"}
        </Text>
      </View>
    </View>
  );
};

/* ===================== PNR STATUS BADGE ===================== */
export const PNRStatusBadges = ({ chartStatus }: BadgesProps) => {
  const isNot = chartStatus?.includes("Not");

  return (
    <View className="flex justify-center items-center">
      <View
        className={`flex-row items-center rounded-full px-3 py-1 border border-gray-400 ${
          isNot ? "bg-red-600" : "bg-green-600"
        }`}
      >
        <View
          className={`w-8 h-8 p-1 rounded-full border-4 border-white justify-center items-center 
          ${isNot ? "bg-red-600" : "bg-green-600"}`}
        >
          <Ionicons
            name={isNot ? "close" : "checkmark"}
            size={18}
            color="white"
          />
        </View>
        <Text className="text-white text-sm ml-2">
          {chartStatus ? chartStatus : "Set PNR Status"}
        </Text>
      </View>
    </View>
  );
};

/* ===================== CLASS + QUOTA BADGES ===================== */
export const ClassQuotaBadges = ({ journeyClass, journeyQuota }: BadgesProps) => {
  return (
    <View className="flex-row rounded-lg overflow-hidden">
      <Text className="bg-blue-500 text-white px-3 py-1 text-sm">
        {journeyClass || "Set Class"}
      </Text>
      <Text className="bg-red-500 text-white px-3 py-1 text-sm">
        {journeyQuota || "Set Quota"}
      </Text>
    </View>
  );
};
