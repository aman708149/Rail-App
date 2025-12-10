import React from "react";
import { View, Text } from "react-native";
import Header from "../Header";

export default function DrawerHome() {
  return (
    <View className="flex-1 items-center justify-center bg-gray-900">
        <Header/>
      <Text className="text-white text-xl">Welcome to Dashboard</Text>
    </View>
  );
}
