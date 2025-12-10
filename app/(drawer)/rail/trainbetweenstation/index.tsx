import TrainList from "@/src/components/Rail/trainbetweenstation/Trainlist";
import React from "react";
import { View, ScrollView } from "react-native";

export default function Page() {
  return (
    <View className="flex-1 flex-row bg-gray-900">

      {/* LEFT SECTION - Train List */}
      <View className="flex-[100] order-2">
        <ScrollView
          className="my-1 pr-1"
          contentContainerStyle={{ paddingBottom: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <TrainList />
        </ScrollView>
      </View>

    </View>
  );
}
