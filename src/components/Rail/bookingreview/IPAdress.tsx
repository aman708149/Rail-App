import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import axios from "axios";
import { showMessage } from "@/src/utils/showMessage"; // <-- You already use this
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function IPAddress() {
    const [ipAddress, setIpAddress] = useState<string>("");

    const apiBase = process.env.EXPO_PUBLIC_FRONTEND_API_URL || "";
    const normalizedUrl = `${apiBase}/api/get-ip`.replace(/([^:]\/)\/+/g, "$1");

    useEffect(() => {
        getIP();
    }, []);

    const getIP = async () => {
        try {
            const response = await axios.get(normalizedUrl);
            if (response?.data?.ip) {
                setIpAddress(response.data.ip);
                 await AsyncStorage.setItem("userIp", customDecode(response.data.ip));
            }
        } catch (error: any) {
            showMessage(
                "Error",
                error?.response?.data?.message || "Something went wrong"
            );
        }
    };

    function customDecode(encodedIp: string): string {
        const encodedOctets = encodedIp.split("_");
        return encodedOctets.map((octet) => octet.split("").reverse().join("")).join(".");
    }

    return (
        <View className="p-2">
            {ipAddress ? (
                <Text className="text-gray-800 dark:text-gray-200">
                    Your IP:{" "}
                    <Text className="text-red-500 font-semibold">
                        {customDecode(ipAddress)}
                    </Text>
                </Text>
            ) : (
                <ActivityIndicator size="small" color="#3b82f6" />
            )}
        </View>
    );
}
