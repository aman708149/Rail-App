import React from 'react';
import { View, Text, useColorScheme, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/theme';
import { router } from 'expo-router';
// import "../../global.css";

export default function RailPage() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'dark'];

  return (
    <View
      className="flex-1 justify-center items-center p-4"
      style={{ backgroundColor: theme.background }}
    >
      <Text
        className="text-2xl font-bold mb-2"
        style={{ color: theme.text }}
      >
        RailPage Screen
      </Text>

      <TouchableOpacity
        className="bg-indigo-600 px-6 py-3 rounded-lg"
        onPress={() => router.push("/auth/login" as any)}
      >
        <Text className="text-white font-semibold text-base">
          Login Now
        </Text>
      </TouchableOpacity>

      <Text
        className="text-base"
        style={{ color: theme.icon }}
      >
        View RailPage.
      </Text>
    </View>
  );
}
