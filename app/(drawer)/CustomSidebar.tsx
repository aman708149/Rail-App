import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useRole } from "@/src/context/RoleProvider";
import { Ionicons } from "@expo/vector-icons";

export default function CustomSidebar() {
  const router = useRouter();
  const [openRail, setOpenRail] = useState(false);
  const { user } = useRole()

  const goTo = (path: string) => {
    router.push(path as any);
  };

  return (
    <View className="flex-1 bg-gray-900 p-4">
      <ScrollView>

        {/* Logo */}
        <View className="items-center mb-6">
          <Ionicons name="train-outline" size={32} color="white" />
          <Text className="text-white font-semibold mt-2">Rail App</Text>
        </View>

        {/* Rail - Available for ALL */}
        <TouchableOpacity
          onPress={() => setOpenRail(!openRail)}
          className="flex-row items-center py-3"
        >
          <Ionicons name="train-outline" size={22} color="white" />
          <Text className="text-white flex-1 ml-2">Rail</Text>
          <Ionicons
            name={openRail ? "chevron-up-outline" : "chevron-down-outline"}
            size={20}
            color="white"
          />
        </TouchableOpacity>

        {openRail && (
          <View className="pl-6">
            {/* 🟢 ONLY FOR AGENT → ALL RAIL PAGES */}
            {user?.role === "agent" && (
              <>
                <TouchableOpacity onPress={() => goTo("/rail/searchTrain")} className="py-2">
                  <Text className="text-gray-300">Search Train</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => goTo("/rail/railbookings")} className="py-2">
                  <Text className="text-gray-300">Rail Bookings</Text>
                </TouchableOpacity>


                <TouchableOpacity onPress={() => goTo("/rail/rail-birdeye-view")} className="py-2">
                  <Text className="text-gray-300">Birdeye View</Text>
                </TouchableOpacity>

              </>
            )}

            {/* 🔴 ONLY FOR ADMIN & PARTNER → ONLY railbookings */}
            {(user?.role === "admin" || user?.role === "partner") && (
              <TouchableOpacity onPress={() => goTo("/rail/railbookings")} className="py-2">
                <Text className="text-gray-300">Rail Bookings</Text>
              </TouchableOpacity>
            )}
          </View>
        )}


        {/* Admin Role */}
        {user?.role === "admin" && (
          <TouchableOpacity onPress={() => goTo("/admin")} className="flex-row py-3">
            <Ionicons name="speedometer-outline" size={22} color="white" />
            <Text className="text-white ml-2">Admin Dashboard</Text>
          </TouchableOpacity>
        )}

        {/* Agent Role */}
        {user?.role === "agent" && (
          <TouchableOpacity onPress={() => goTo("/agent")} className="flex-row py-3">
            <Ionicons name="briefcase-outline" size={22} color="white" />
            <Text className="text-white ml-2">Agent Dashboard</Text>
          </TouchableOpacity>
        )}

        {/* Partner Role */}
        {user?.role === "partner" && (
          <TouchableOpacity onPress={() => goTo("/partner")} className="flex-row py-3">
            <Ionicons name="people-outline" size={22} color="white" />
            <Text className="text-white ml-2">Partner Dashboard</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}
