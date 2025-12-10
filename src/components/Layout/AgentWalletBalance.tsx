// AgentWalletBalance.tsx

import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { CheckWalletBalanceService } from "@/src/service/railService/walletRecharge/walletRecharge.service";
import { formatToSouthAsian } from "@/src/utils/Number";

export default function AgentWalletBalance() {
  const [userBalance, setUserBalance] = useState<number>(0);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [showBalanceInfo, setShowBalanceInfo] = useState(false);
  const didCall = useRef(false);

  useEffect(() => {
    if (!didCall.current) {
      didCall.current = true;
      checkWalletBalance();
    }
  }, []);

  const checkWalletBalance = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError("");
    try {
      const response = await CheckWalletBalanceService();
      if (response?.data?.status === true) {
        setUserBalance(Number(response?.data?.data?.balance));
        setLastUpdated(new Date());
        setShowBalanceInfo(true);
      } else {
        setShowBalanceInfo(false);
      }
    } catch (error: any) {
      setError(error?.response?.data?.message ?? "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (!showBalanceInfo) return null;

  return (
    <View className="w-full bg-primary/30 rounded-xl shadow-lg mt-4">
      <View className="px-5">
        <View className="flex-row justify-between items-center mt-3">
          <Text className="text-xl font-bold text-gray-800 dark:text-gray-100">
            Wallet Balance
          </Text>
          <TouchableOpacity
            onPress={checkWalletBalance}
            disabled={isLoading}
            className="p-2 rounded-full bg-green-600 active:bg-green-700"
          >
            <MaterialIcons
              name="refresh"
              size={20}
              color="white"
              className={isLoading ? "animate-spin" : ""}
            />
          </TouchableOpacity>
        </View>

        {/* Error Box */}
        {error ? (
          <View className="p-3 my-3 bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-400 rounded">
            <Text className="text-red-700 dark:text-red-200">{error}</Text>
          </View>
        ) : isLoading && userBalance === 0 ? (
          <View className="flex justify-center items-center h-20">
            <ActivityIndicator size="large" color="#4f46e5" />
          </View>
        ) : (
          <View className="flex flex-col items-center justify-center py-4">
            <Text className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Available Balance
            </Text>
            <Text className="text-3xl font-bold text-green-600">
              ₹ {formatToSouthAsian(userBalance)}
            </Text>
            <Text className="mt-2 text-xs text-gray-400 dark:text-gray-500">
              {lastUpdated
                ? `Last updated: ${lastUpdated.toLocaleTimeString()}`
                : "Not updated yet"}
            </Text>
          </View>
        )}
      </View>

      <View className="px-5 py-2 border-t border-gray-200 dark:border-gray-700 bg-primary/30">
        <Text className="text-xs text-center text-gray-600 dark:text-gray-300">
          Top up, seamless booking
        </Text>
      </View>
    </View>
  );
}
