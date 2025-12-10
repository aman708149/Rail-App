import React from "react";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View } from "react-native";
import Header from "@/app/Header";

// Fix SafeAreaView warning globally
(View as any).SafeAreaView = SafeAreaView;

export default function RailLayout() {
  return (
    <>

      <Header />

      {/* ❗ Expo Router will auto-detect ALL files in /rail folder */}
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
