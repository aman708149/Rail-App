import Header from "@/app/Header";
import { Stack } from "expo-router";
import { View } from "react-native";

export default function PartnerLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Header />
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}
