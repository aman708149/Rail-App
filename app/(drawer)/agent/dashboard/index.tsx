import React from 'react';
import { View, Text, useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';
// import "../../../global.css"

export default function AgentDashboard() {
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
        AgentDashboard Screen
      </Text>

      <Text
        className="text-base"
        style={{ color: theme.icon }}
      >
        View AgentDashboard.
      </Text>
    </View>
  );
}
