import React from "react";
import { View, Text, ActivityIndicator, ScrollView } from "react-native";
import { useSelector } from "react-redux";

import SearchCard from "./SearchCard";
import SortingCard from "./SortingCard";
import { RootStore } from "@/src/store";
import { selectFilteredTrains } from "@/src/store/rail/trainBetweenStation/trainSelectors";
import TrainCard from "./TrainCard";
import TrainListSkeleton from "./TrainListSkeleton";


export default function Trainlist() {
  const { journeyDate, status, error } = useSelector(
    (state: RootStore) => state.trainBetweenStation
  );

  const filteredTrains = useSelector(selectFilteredTrains);

  return (
    <ScrollView className="w-full p-2">

      {/* ---------------- SEARCH CARD WRAPPER ---------------- */}
      <View className="bg-white dark:bg-gray-800 rounded-xl shadow p-0 mt-0">
        <SearchCard />
      </View>

      {/* ---------------- LOADING STATE ---------------- */}
      {status === "loading" && (
        <View className="mt-3">
          {[...Array(5)].map((_, index) => (
            <TrainListSkeleton key={index} />
          ))}
        </View>
      )}

      {/* ---------------- ERROR STATE ---------------- */}
      {status !== "loading" && error && (
        <Text className="text-red-600 text-center font-semibold mt-3">
          Error: {error}
        </Text>
      )}

      {/* ---------------- TRAIN LIST ---------------- */}
      {status !== "loading" && !error && (
        <View className="mt-3">

          {/* SORTING BAR */}
          {filteredTrains.length > 0 && <SortingCard />}

          {/* TRAIN CARDS */}
          {filteredTrains.length > 0 &&
            filteredTrains.map((train, index) => (

              <TrainCard
                key={train.trainNumber}
                train={train}
                journeyDate={journeyDate}
                index={index}
              />
            ))}

          {/* END LIST CARD */}
          {filteredTrains.length > 0 && (
            <View className="border-2 border-gray-300 dark:border-gray-700 rounded-lg p-4 mt-3 bg-white dark:bg-gray-900">
              <Text className="text-center text-gray-700 dark:text-gray-200">
                --- End of Train List ---
              </Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}
