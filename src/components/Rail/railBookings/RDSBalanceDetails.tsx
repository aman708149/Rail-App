// 📌 src/components/RDSBalanceDetails.tsx

import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { formatNumberToSouthAsian } from "@/src/utils/Number";
import { showMessage } from "@/src/utils/showMessage";   // <-- Alert handler
import { Ionicons } from "@expo/vector-icons";
import { GetRDSBalanceservice } from "@/src/service/adminservice";

interface RDSBalanceData {
  balanceLeft?: number;
}

export default function RDSBalanceDetails() {
  const [loading, setLoading] = useState<boolean>(false);
  const [rdsBalance, setRdsBalance] = useState<RDSBalanceData | null>(null);
  const [rdsError, setRdsError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  // 🔄 Fetch API
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await GetRDSBalanceservice();
      if (response?.data?.balanceLeft) {
        setRdsBalance(response.data);
      }
    } catch (error: any) {
      setRdsError(error.message);
      showMessage("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      className="flex-row w-full gap-2 my-3 p-2 bg-transparent"
    >
      {/* 🔄 Loading Animation */}
      {loading ? (
        <ActivityIndicator size="small" color="#22c55e" />
      ) : rdsError ? (
        <Text className="text-red-500 text-sm">{rdsError}</Text>
      ) : (
        <>
          {/* 🧾 TOTAL BALANCE */}
          <View className="bg-slate-800 px-4 py-2 rounded-lg">
            <Text className="text-gray-300 text-xs">Total Balance</Text>
            <Text className="text-green-400 font-semibold">
              ₹ {rdsBalance?.balanceLeft ? formatNumberToSouthAsian(rdsBalance.balanceLeft) : "0"}
            </Text>
          </View>

          {/* 💰 USABLE BALANCE */}
          {rdsBalance && (
            <View className="bg-slate-800 px-4 py-2 rounded-lg">
              <Text className="text-gray-300 text-xs">Usable Balance</Text>
              <Text className="text-green-400 font-semibold">
                ₹ {rdsBalance.balanceLeft
                  ? formatNumberToSouthAsian(rdsBalance.balanceLeft - 100000)
                  : "0"}
              </Text>
            </View>
          )}

          {/* 🔄 REFRESH BUTTON */}
          <TouchableOpacity
            onPress={fetchData}
            className="bg-blue-600 px-4 py-2 rounded-lg flex-row items-center"
          >
            <Ionicons name="reload" size={18} color="white" />
            <Text className="ml-2 text-white">Refresh</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}
