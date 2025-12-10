
import React from "react";
import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
// import "../../global.css"
import { useRole } from "@/src/context/RoleProvider";

export default function AgentDashboard() {
  const user = useRole();
  const fullName = user?.user?.userFullName;
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-[#0b0c1a]">
      {/* Train Image */}
      <View className="mt-4 mx-3 rounded-2xl overflow-hidden">
        <Image
          source={require("../../../assets/images/irctc-vande-bharat-express-train.webp")}
          className="w-full h-48 rounded-2xl"
          resizeMode="cover"
        />
      </View>

      {/* Welcome Text */}
      <View className="mt-6 px-5 items-center">
        {fullName && (
          <Text className="text-white text-xl font-semibold text-center">
            Hello{" "}
            <Text className="text-green-500 font-bold">{fullName}</Text>,
          </Text>
        )}

        <Text className="text-lg font-bold text-white mt-1 text-center">
          Welcome to Agent Dashboard
        </Text>
        <Text className="text-gray-300 text-sm mt-2 text-center leading-5">
          Our portal provides a robust platform for managing ticket bookings efficiently.
          With intuitive controls and comprehensive features, administrators can oversee
          and facilitate ticket reservations seamlessly.
        </Text>
      </View>

      {/* Buttons */}
      <View className="flex-row flex-wrap justify-center items-center mt-8 px-4 gap-4">
        <TouchableOpacity
          onPress={() => router.replace("/rail/searchTrain" as any)}
          className="bg-white/5 w-[45%] aspect-square rounded-2xl items-center justify-center border border-white/10 shadow-lg shadow-black/20 active:bg-white/10 transition-all duration-200"
          activeOpacity={0.7}
        >
          <View className="bg-blue-500/20 p-4 rounded-full mb-3">
            <Text className="text-3xl">🚆</Text>
          </View>
          <Text className="text-white text-sm font-semibold uppercase tracking-wider">
            Search Train
          </Text>
          <Text className="text-white/60 text-xs mt-1 text-center px-2 mb-8">
            Find & book trains
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.replace("/rail/railbookings" as any)}
          className="bg-white/5 w-[45%] aspect-square rounded-2xl items-center justify-center border border-white/10 shadow-lg shadow-black/20 active:bg-white/10 transition-all duration-200"
          activeOpacity={0.7}
        >
          <View className="bg-emerald-500/20 p-4 rounded-full mb-3">
            <Text className="text-3xl">📋</Text>
          </View>
          <Text className="text-white text-sm font-semibold uppercase tracking-wider">
            My Bookings
          </Text>
          <Text className="text-white/60 text-xs mt-1 text-center px-2 mb-8">
            View & manage tickets
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.replace("/rail/cancellation" as any)}
          className="bg-white/5 w-[45%] aspect-square rounded-2xl items-center justify-center border border-white/10 shadow-lg shadow-black/20 active:bg-white/10 transition-all duration-200"
          activeOpacity={0.7}
        >
          <View className="bg-rose-500/20 p-4 rounded-full mb-3">
            <Text className="text-3xl">✕</Text>
          </View>
          <Text className="text-white text-sm font-semibold uppercase tracking-wider">
            Cancel Ticket
          </Text>
          <Text className="text-white/60 text-xs mt-1 text-center px-2">
            Cancel & get refund
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.replace("/rail/pnr-status" as any)}
          className="bg-white/5 w-[45%] aspect-square rounded-2xl items-center justify-center border border-white/10 shadow-lg shadow-black/20 active:bg-white/10 transition-all duration-200"
          activeOpacity={0.7}
        >
          <View className="bg-purple-500/20 p-4 rounded-full mb-3">
            <Text className="text-3xl">🔍</Text>
          </View>
          <Text className="text-white text-sm font-semibold uppercase tracking-wider">
            PNR Status
          </Text>
          <Text className="text-white/60 text-xs mt-1 text-center px-2 mb-8">
            Check booking status
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

