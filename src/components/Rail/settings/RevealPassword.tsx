import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import Clipboard from "expo-clipboard";
import { showMessage } from "@/src/utils/showMessage";
import axiosInstance from "@/src/utils/axios";

export default function RevealIRCTC() {
  const [plain, setPlain] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  async function handleReveal() {
    setStatus("");
    setPlain("");
    setLoading(true);

    try {
       const res = await axiosInstance.get(
                `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/agents/rail/reveal`
            );

      if (res?.data?.password) {
        setPlain(res.data.password);

        // Copy to clipboard
        try {
          await Clipboard.setStringAsync(res.data?.password);
          showMessage("Success", "Password copied to clipboard!");
        } catch (err) {
          setStatus("Password revealed (copy failed, please copy manually).");
        }

        // Hide password after 10s
        setTimeout(() => setPlain(""), 10000);
      } else {
        setStatus("Failed to fetch password");
      }
    } catch (error: any) {
      showMessage("Error", error?.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View>
      {/* Reveal Button */}
      <TouchableOpacity
        onPress={handleReveal}
        disabled={loading}
        className="ml-1"
      >
        <Text className="text-blue-600 underline text-sm">
          {loading ? "Fetching password..." : "View Saved Password"}
        </Text>
      </TouchableOpacity>

      {/* Loading Indicator */}
      {loading && <ActivityIndicator size="small" className="mt-2" />}

      {/* Show Password */}
      {plain ? (
        <Text className="text-green-600 text-base font-semibold mt-2">
          Password: <Text className="font-mono">{plain}</Text>
        </Text>
      ) : null}

      {/* Status Error */}
      {status ? (
        <Text className="text-red-500 mt-1 font-medium text-center">
          {status}
        </Text>
      ) : null}
    </View>
  );
}
