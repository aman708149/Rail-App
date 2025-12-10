import React from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import LeftSideBar from "@/src/components/Layout/LeftSideBar";
import Header from "@/app/Header";

export default function AgentLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Header />  
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}
